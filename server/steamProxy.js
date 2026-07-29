import { createServer } from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

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

loadEnvFile()

const PORT = Number(process.env.STEAM_PROXY_PORT ?? 3001)
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL ?? 'http://localhost:5173'
const SERVER_BASE_URL = process.env.SERVER_BASE_URL ?? `http://localhost:${PORT}`
const SESSION_SECRET =
  process.env.SESSION_SECRET ??
  (process.env.VERCEL ? '' : 'steam-achievement-wiki-local-development')
const SESSION_COOKIE_NAME = 'steam_achievement_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
let steamAppsCache = null
let steamPopularTagsCache = null
const steamStoreDetailsCache = new Map()

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': CLIENT_BASE_URL,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(data))
}

function redirect(response, url, headers = {}) {
  response.writeHead(302, {
    Location: url,
    'Access-Control-Allow-Origin': CLIENT_BASE_URL,
    'Access-Control-Allow-Credentials': 'true',
    ...headers,
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

async function fetchSteamStoreDetails(appid) {
  if (steamStoreDetailsCache.has(appid)) {
    return steamStoreDetailsCache.get(appid)
  }

  const detailsUrl = new URL('https://store.steampowered.com/api/appdetails')
  detailsUrl.searchParams.set('appids', String(appid))
  detailsUrl.searchParams.set('l', 'koreana')
  detailsUrl.searchParams.set('cc', 'kr')

  const data = await fetchJson(detailsUrl)
  const result = data?.[String(appid)]
  const details = result?.success ? result.data : null

  steamStoreDetailsCache.set(appid, details)

  return details
}

function getStoreGenres(storeDetails) {
  return (storeDetails?.genres ?? [])
    .map((genre) => String(genre.description ?? '').trim())
    .filter(Boolean)
}

async function fetchSteamPopularTags() {
  if (steamPopularTagsCache) {
    return steamPopularTagsCache
  }

  const tags = await fetchJson(
    'https://store.steampowered.com/tagdata/populartags/koreana',
  )

  steamPopularTagsCache = Array.isArray(tags)
    ? tags
        .map((tag) => ({
          id: Number(tag.tagid),
          name: String(tag.name ?? '').trim(),
        }))
        .filter((tag) => Number.isFinite(tag.id) && tag.name)
    : []

  return steamPopularTagsCache
}

function createSteamGame(app, storeDetails) {
  const appid = Number(app.appid)
  const genres = getStoreGenres(storeDetails)
  const achievementCount = Number(storeDetails?.achievements?.total ?? 0)

  return {
    id: appid,
    steamAppId: appid,
    title: storeDetails?.name ?? app.name,
    description:
      stripHtml(storeDetails?.short_description) ||
      'Steam Store에서 게임 설명을 제공하지 않았습니다.',
    genre: genres.join(', ') || '장르 정보 없음',
    developer: (storeDetails?.developers ?? []).join(', ') || '정보 없음',
    publisher: (storeDetails?.publishers ?? []).join(', ') || '정보 없음',
    releaseDate: storeDetails?.release_date?.date || '정보 없음',
    image:
      storeDetails?.header_image ??
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    storeUrl: `https://store.steampowered.com/app/${appid}`,
    achievementCount,
    averageRate: 0,
    hasAchievements: achievementCount > 0,
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
      const tagIds = [
        ...(row.match(/data-ds-tagids="\[([^\]]*)\]"/)?.[1].matchAll(/\d+/g) ??
          []),
      ].map((match) => Number(match[0]))

      if (!Number.isFinite(appId) || !title) {
        return null
      }

      return {
        appid: appId,
        name: title,
        image,
        releaseDate,
        tagIds,
      }
    })
    .filter(Boolean)
}

async function enrichSteamStoreGames(apps, tagNameById) {
  const enrichedApps = []
  const batchSize = 8

  for (let index = 0; index < apps.length; index += batchSize) {
    const batch = apps.slice(index, index + batchSize)
    const results = await Promise.all(
      batch.map(async (app) => {
        const { tagIds, ...baseApp } = app
        const tags = tagIds
          .map((tagId) => tagNameById.get(tagId))
          .filter(Boolean)

        try {
          const details = await fetchSteamStoreDetails(app.appid)
          const genres = getStoreGenres(details)

          return {
            ...baseApp,
            image: details?.header_image ?? app.image,
            releaseDate: details?.release_date?.date || app.releaseDate,
            genres,
            tags,
            hasAchievements: Number(details?.achievements?.total ?? 0) > 0,
          }
        } catch {
          return {
            ...baseApp,
            genres: [],
            tags,
            hasAchievements: false,
          }
        }
      }),
    )

    enrichedApps.push(...results)
  }

  return enrichedApps
}

async function handleSteamStoreGames(requestUrl, response) {
  const query = requestUrl.searchParams.get('query') ?? ''
  const start = Math.max(Number(requestUrl.searchParams.get('start') ?? 0), 0)
  const count = Math.min(Number(requestUrl.searchParams.get('count') ?? 20), 50)
  const filter = requestUrl.searchParams.get('filter') ?? 'globaltopsellers'
  const selectedTagName = requestUrl.searchParams.get('tag')?.trim() ?? ''
  const storeUrl = new URL('https://store.steampowered.com/search/results/')

  storeUrl.searchParams.set('query', query)
  storeUrl.searchParams.set('term', query)
  storeUrl.searchParams.set('start', String(start))
  storeUrl.searchParams.set('count', String(count))
  storeUrl.searchParams.set('dynamic_data', '')
  storeUrl.searchParams.set('filter', filter)
  storeUrl.searchParams.set('category1', '998')
  storeUrl.searchParams.set('infinite', '1')
  storeUrl.searchParams.set('l', 'koreana')
  storeUrl.searchParams.set('cc', 'kr')

  try {
    const popularTags = await fetchSteamPopularTags()
    const tagNameById = new Map(
      popularTags.map((tag) => [tag.id, tag.name]),
    )
    const selectedTag = popularTags.find(
      (tag) =>
        tag.name.toLocaleLowerCase('ko') ===
        selectedTagName.toLocaleLowerCase('ko'),
    )

    if (selectedTag) {
      storeUrl.searchParams.set('tags', String(selectedTag.id))
    }

    const data = await fetchJson(storeUrl)
    const parsedApps = parseStoreSearchResults(data?.results_html).slice(0, count)
    const apps = await enrichSteamStoreGames(parsedApps, tagNameById)

    sendJson(response, 200, {
      apps,
      tagCatalog: popularTags.map((tag) => tag.name),
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

  try {
    const storeDetails = await fetchSteamStoreDetails(Number(appid))
    let app = storeDetails
      ? { appid: Number(appid), name: storeDetails.name }
      : null

    if (!app && key) {
      const apps = await fetchSteamApps(key)
      app = apps.find((target) => Number(target.appid) === Number(appid))
    }

    if (!app) {
      sendJson(response, 404, { message: 'Steam app was not found.' })
      return
    }

    sendJson(response, 200, { game: createSteamGame(app, storeDetails) })
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

function createSessionToken(steamId) {
  if (!SESSION_SECRET) {
    return null
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  const payload = `${steamId}.${expiresAt}`
  const signature = createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url')

  return `${payload}.${signature}`
}

function verifySessionToken(token) {
  if (!SESSION_SECRET || !token) {
    return null
  }

  const [steamId, expiresAtValue, providedSignature] = token.split('.')
  const expiresAt = Number(expiresAtValue)

  if (
    !/^\d+$/.test(steamId ?? '') ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000) ||
    !providedSignature
  ) {
    return null
  }

  const payload = `${steamId}.${expiresAt}`
  const expectedSignature = createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url')
  const expectedBuffer = Buffer.from(expectedSignature)
  const providedBuffer = Buffer.from(providedSignature)

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null
  }

  return steamId
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie ?? ''
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
  const cookie = cookies.find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null
}

function createSessionCookie(token, maxAge = SESSION_MAX_AGE_SECONDS) {
  const secure = SERVER_BASE_URL.startsWith('https://') ? '; Secure' : ''

  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
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

    const sessionToken = createSessionToken(steamId)

    if (!sessionToken) {
      redirect(response, `${CLIENT_BASE_URL}/login?error=session-config`)
      return
    }

    redirect(response, `${CLIENT_BASE_URL}/login?connected=1`, {
      'Set-Cookie': createSessionCookie(sessionToken),
    })
  } catch {
    redirect(response, `${CLIENT_BASE_URL}/login?error=steam-auth`)
  }
}

function handleSteamSession(request, response) {
  const token = getCookie(request, SESSION_COOKIE_NAME)
  const steamId = verifySessionToken(token)

  if (!steamId) {
    sendJson(response, 401, { user: null })
    return
  }

  sendJson(response, 200, { user: { steamId } })
}

function handleSteamLogout(response) {
  sendJsonWithHeaders(response, 200, { ok: true }, {
    'Set-Cookie': createSessionCookie('', 0),
  })
}

function sendJsonWithHeaders(response, statusCode, data, headers) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': CLIENT_BASE_URL,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  })
  response.end(JSON.stringify(data))
}

async function handleSteamLibrary(request, response) {
  const token = getCookie(request, SESSION_COOKIE_NAME)
  const steamid = verifySessionToken(token)
  const key = getSteamApiKey()

  if (!steamid) {
    sendJson(response, 401, { message: 'Steam login is required.' })
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

export async function handleSteamProxyRequest(request, response) {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': CLIENT_BASE_URL,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
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
    requestUrl.pathname === '/api/auth/session'
  ) {
    handleSteamSession(request, response)
    return
  }

  if (
    request.method === 'POST' &&
    requestUrl.pathname === '/api/auth/logout'
  ) {
    handleSteamLogout(response)
    return
  }

  if (
    request.method === 'GET' &&
    requestUrl.pathname === '/api/auth/steam/callback'
  ) {
    return handleSteamCallback(requestUrl, response)
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/steam/library') {
    return handleSteamLibrary(request, response)
  }

  if (
    request.method === 'GET' &&
    requestUrl.pathname === '/api/steam/achievements'
  ) {
    return handleSteamAchievements(requestUrl, response)
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/steam/apps') {
    return handleSteamApps(requestUrl, response)
  }

  if (
    request.method === 'GET' &&
    requestUrl.pathname === '/api/steam/store-games'
  ) {
    return handleSteamStoreGames(requestUrl, response)
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/steam/game') {
    return handleSteamGame(requestUrl, response)
  }

  sendJson(response, 404, { message: 'Not Found' })
}

function startSteamProxyServer() {
  createServer(handleSteamProxyRequest).listen(PORT, () => {
    console.log(`Steam proxy server running at http://localhost:${PORT}`)
  })
}

const executedFileUrl = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : ''

if (import.meta.url === executedFileUrl) {
  startSteamProxyServer()
}
