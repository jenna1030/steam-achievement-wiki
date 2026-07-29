import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = Number(process.env.STEAM_PROXY_PORT ?? 3001)
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL ?? 'http://localhost:5173'
const SERVER_BASE_URL = process.env.SERVER_BASE_URL ?? `http://localhost:${PORT}`
let steamAppsCache = null

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const env = readFileSync(envPath, 'utf8')

    for (const line of env.split(/\r?\n/)) {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue
      }

      const separatorIndex = trimmedLine.indexOf('=')

      if (separatorIndex === -1) {
        continue
      }

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const value = trimmedLine.slice(separatorIndex + 1).trim()

      process.env[key] ??= value.replace(/^["']|["']$/g, '')
    }
  } catch {
    // Each API handler returns a clear error if a required env value is missing.
  }
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': CLIENT_BASE_URL,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(data))
}

function redirect(response, url) {
  response.writeHead(302, {
    Location: url,
    'Access-Control-Allow-Origin': CLIENT_BASE_URL,
  })
  response.end()
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Steam API request failed: ${response.status}`)
  }

  return response.json()
}

function getSchemaAchievements(schemaData) {
  return schemaData?.game?.availableGameStats?.achievements ?? []
}

function getPercentageAchievements(percentData) {
  return percentData?.achievementpercentages?.achievements ?? []
}

function mergeAchievements(schemaAchievements, percentageAchievements) {
  const schemaMap = new Map(
    schemaAchievements.map((achievement) => [achievement.name, achievement]),
  )
  const percentageMap = new Map(
    percentageAchievements.map((achievement) => [
      achievement.name,
      Number(achievement.percent),
    ]),
  )
  const achievementNames = new Set([
    ...schemaMap.keys(),
    ...percentageMap.keys(),
  ])

  return [...achievementNames].map((name) => {
    const schema = schemaMap.get(name)
    const percent = percentageMap.get(name)

    return {
      name,
      percent: Number.isFinite(percent) ? percent : 0,
      displayName: schema?.displayName ?? name,
      description: schema?.description ?? '',
      icon: schema?.icon ?? '',
      icongray: schema?.icongray ?? '',
      hidden: Number(schema?.hidden ?? 0),
    }
  })
}

function getSteamApiKey() {
  return process.env.STEAM_API_KEY
}

function getFilteredApps(apps, query, limit) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return []
  }

  return apps
    .filter((app) => {
      const name = String(app.name ?? '').toLowerCase()
      const appid = String(app.appid ?? '')

      return name.includes(normalizedQuery) || appid.includes(normalizedQuery)
    })
    .sort((a, b) => {
      const aName = String(a.name ?? '').toLowerCase()
      const bName = String(b.name ?? '').toLowerCase()
      const aStartsWithQuery = aName.startsWith(normalizedQuery)
      const bStartsWithQuery = bName.startsWith(normalizedQuery)

      if (aStartsWithQuery !== bStartsWithQuery) {
        return aStartsWithQuery ? -1 : 1
      }

      return aName.length - bName.length
    })
    .slice(0, limit)
}

function createSteamGame(app) {
  const appid = Number(app.appid)

  return {
    id: appid,
    steamAppId: appid,
    title: app.name,
    description:
      'Steam 공식 앱 목록에서 가져온 게임입니다. 도전과제 목록과 전체 달성률은 Steam Web API로 불러옵니다.',
    genre: 'Steam App',
    developer: 'Steam 제공',
    publisher: 'Steam 제공',
    releaseDate: 'Steam API 기준',
    image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    storeUrl: `https://store.steampowered.com/app/${appid}`,
    achievementCount: 0,
    averageRate: 0,
    hasAchievements: true,
    isPopular: false,
  }
}

function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripHtml(value) {
  return decodeHtmlEntities(String(value ?? '').replace(/<[^>]*>/g, '')).trim()
}

function parseStoreSearchResults(resultsHtml) {
  const rows = String(resultsHtml ?? '').match(
    /<a[^>]+class="[^"]*search_result_row[^"]*"[\s\S]*?<\/a>/g,
  )

  if (!rows) {
    return []
  }

  return rows
    .map((row) => {
      const appId = Number(row.match(/data-ds-appid="(\d+)"/)?.[1])
      const title = stripHtml(row.match(/<span class="title">([\s\S]*?)<\/span>/)?.[1])
      const image = decodeHtmlEntities(row.match(/<img[^>]+src="([^"]+)"/)?.[1])
      const releaseDate = stripHtml(
        row.match(/<div class="col search_released responsive_secondrow">([\s\S]*?)<\/div>/)?.[1],
      )

      if (!Number.isFinite(appId) || !title) {
        return null
      }

      return {
        appid: appId,
        name: title,
        image,
        releaseDate,
      }
    })
    .filter(Boolean)
}

async function handleSteamStoreGames(requestUrl, response) {
  const query = requestUrl.searchParams.get('query') ?? ''
  const start = Math.max(Number(requestUrl.searchParams.get('start') ?? 0), 0)
  const count = Math.min(Number(requestUrl.searchParams.get('count') ?? 20), 50)
  const filter = requestUrl.searchParams.get('filter') ?? 'globaltopsellers'
  const storeUrl = new URL('https://store.steampowered.com/search/results/')

  storeUrl.searchParams.set('query', query)
  storeUrl.searchParams.set('term', query)
  storeUrl.searchParams.set('start', String(start))
  storeUrl.searchParams.set('count', String(count))
  storeUrl.searchParams.set('dynamic_data', '')
  storeUrl.searchParams.set('filter', filter)
  storeUrl.searchParams.set('category1', '998')
  storeUrl.searchParams.set('infinite', '1')

  try {
    const data = await fetchJson(storeUrl)
    const apps = parseStoreSearchResults(data?.results_html)

    sendJson(response, 200, {
      apps,
      start,
      count,
      totalCount: Number(data?.total_count ?? apps.length),
    })
  } catch (error) {
    sendJson(response, 502, {
      message:
        error instanceof Error
          ? error.message
          : 'Could not fetch Steam Store results.',
    })
  }
}

async function fetchSteamApps(key) {
  if (steamAppsCache) {
    return steamAppsCache
  }

  const appsUrl = new URL(
    'https://api.steampowered.com/IStoreService/GetAppList/v1/',
  )
  appsUrl.searchParams.set('key', key)
  appsUrl.searchParams.set('include_games', 'true')
  appsUrl.searchParams.set('include_dlc', 'false')
  appsUrl.searchParams.set('include_software', 'false')
  appsUrl.searchParams.set('include_videos', 'false')
  appsUrl.searchParams.set('include_hardware', 'false')
  appsUrl.searchParams.set('max_results', '50000')

  const data = await fetchJson(appsUrl)
  steamAppsCache = data?.response?.apps ?? []

  return steamAppsCache
}

async function handleSteamApps(requestUrl, response) {
  const query = requestUrl.searchParams.get('query') ?? ''
  const limit = Math.min(Number(requestUrl.searchParams.get('limit') ?? 12), 30)
  const key = getSteamApiKey()

  if (query.trim().length < 2) {
    sendJson(response, 200, { apps: [] })
    return
  }

  if (!key) {
    sendJson(response, 500, { message: 'STEAM_API_KEY is missing.' })
    return
  }

  try {
    const apps = await fetchSteamApps(key)

    sendJson(response, 200, {
      apps: getFilteredApps(apps, query, limit),
      totalCached: apps.length,
    })
  } catch (error) {
    sendJson(response, 502, {
      message:
        error instanceof Error
          ? error.message
          : 'Could not process the Steam app list.',
    })
  }
}

async function handleSteamGame(requestUrl, response) {
  const appid = requestUrl.searchParams.get('appid')
  const key = getSteamApiKey()

  if (!appid || !/^\d+$/.test(appid)) {
    sendJson(response, 400, { message: 'A valid appid is required.' })
    return
  }

  if (!key) {
    sendJson(response, 500, { message: 'STEAM_API_KEY is missing.' })
    return
  }

  try {
    const apps = await fetchSteamApps(key)
    const app = apps.find((target) => Number(target.appid) === Number(appid))

    if (!app) {
      sendJson(response, 404, { message: 'Steam app was not found.' })
      return
    }

    sendJson(response, 200, { game: createSteamGame(app) })
  } catch (error) {
    sendJson(response, 502, {
      message:
        error instanceof Error ? error.message : 'Could not fetch Steam app.',
    })
  }
}

async function handleSteamAchievements(requestUrl, response) {
  const appid = requestUrl.searchParams.get('appid')
  const language = requestUrl.searchParams.get('lang') ?? 'koreana'
  const key = getSteamApiKey()

  if (!appid || !/^\d+$/.test(appid)) {
    sendJson(response, 400, { message: 'A valid appid is required.' })
    return
  }

  if (!key) {
    sendJson(response, 500, { message: 'STEAM_API_KEY is missing.' })
    return
  }

  const schemaUrl = new URL(
    'https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/',
  )
  schemaUrl.searchParams.set('key', key)
  schemaUrl.searchParams.set('appid', appid)
  schemaUrl.searchParams.set('l', language)
  schemaUrl.searchParams.set('format', 'json')

  const percentagesUrl = new URL(
    'https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/',
  )
  percentagesUrl.searchParams.set('gameid', appid)
  percentagesUrl.searchParams.set('format', 'json')

  try {
    const [schemaData, percentData] = await Promise.all([
      fetchJson(schemaUrl),
      fetchJson(percentagesUrl),
    ])
    const schemaAchievements = getSchemaAchievements(schemaData)
    const percentageAchievements = getPercentageAchievements(percentData)

    sendJson(response, 200, {
      appid: Number(appid),
      achievements: mergeAchievements(schemaAchievements, percentageAchievements),
      schemaCount: schemaAchievements.length,
      percentageCount: percentageAchievements.length,
    })
  } catch (error) {
    sendJson(response, 502, {
      message:
        error instanceof Error
          ? error.message
          : 'Could not process the Steam achievement response.',
    })
  }
}

async function verifySteamOpenId(requestUrl) {
  const params = new URLSearchParams()

  for (const [key, value] of requestUrl.searchParams.entries()) {
    params.set(key, value)
  }

  params.set('openid.mode', 'check_authentication')

  const response = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const text = await response.text()

  return text.includes('is_valid:true')
}

function getSteamIdFromClaimedId(claimedId) {
  const match = claimedId?.match(/\/id\/(\d+)$/)

  return match?.[1]
}

function handleSteamLogin(response) {
  const returnTo = `${SERVER_BASE_URL}/api/auth/steam/callback`
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': SERVER_BASE_URL,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  redirect(response, `https://steamcommunity.com/openid/login?${params}`)
}

async function handleSteamCallback(requestUrl, response) {
  try {
    const isValid = await verifySteamOpenId(requestUrl)
    const steamId = getSteamIdFromClaimedId(
      requestUrl.searchParams.get('openid.claimed_id'),
    )

    if (!isValid || !steamId) {
      redirect(response, `${CLIENT_BASE_URL}/login?error=steam-auth`)
      return
    }

    redirect(response, `${CLIENT_BASE_URL}/login?steamid=${steamId}`)
  } catch {
    redirect(response, `${CLIENT_BASE_URL}/login?error=steam-auth`)
  }
}

async function handleSteamLibrary(requestUrl, response) {
  const steamid = requestUrl.searchParams.get('steamid')
  const key = getSteamApiKey()

  if (!steamid || !/^\d+$/.test(steamid)) {
    sendJson(response, 400, { message: 'A valid steamid is required.' })
    return
  }

  if (!key) {
    sendJson(response, 500, { message: 'STEAM_API_KEY is missing.' })
    return
  }

  const libraryUrl = new URL(
    'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
  )
  libraryUrl.searchParams.set('key', key)
  libraryUrl.searchParams.set('steamid', steamid)
  libraryUrl.searchParams.set('include_appinfo', 'true')
  libraryUrl.searchParams.set('include_played_free_games', 'true')
  libraryUrl.searchParams.set('format', 'json')

  try {
    const data = await fetchJson(libraryUrl)
    const games = data?.response?.games ?? []

    sendJson(response, 200, {
      gameCount: Number(data?.response?.game_count ?? games.length),
      games,
    })
  } catch (error) {
    sendJson(response, 502, {
      message:
        error instanceof Error
          ? error.message
          : 'Could not fetch the Steam library.',
    })
  }
}

loadEnvFile()

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': CLIENT_BASE_URL,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    response.end()
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/auth/steam') {
    handleSteamLogin(response)
    return
  }

  if (
    request.method === 'GET' &&
    requestUrl.pathname === '/api/auth/steam/callback'
  ) {
    void handleSteamCallback(requestUrl, response)
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/steam/library') {
    void handleSteamLibrary(requestUrl, response)
    return
  }

  if (
    request.method === 'GET' &&
    requestUrl.pathname === '/api/steam/achievements'
  ) {
    void handleSteamAchievements(requestUrl, response)
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/steam/apps') {
    void handleSteamApps(requestUrl, response)
    return
  }

  if (
    request.method === 'GET' &&
    requestUrl.pathname === '/api/steam/store-games'
  ) {
    void handleSteamStoreGames(requestUrl, response)
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/steam/game') {
    void handleSteamGame(requestUrl, response)
    return
  }

  sendJson(response, 404, { message: 'Not Found' })
}).listen(PORT, () => {
  console.log(`Steam proxy server running at http://localhost:${PORT}`)
})
