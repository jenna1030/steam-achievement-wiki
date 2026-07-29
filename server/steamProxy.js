import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = Number(process.env.STEAM_PROXY_PORT ?? 3001)
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
    // The API endpoint returns a clear error if STEAM_API_KEY is missing.
  }
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(data))
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Steam API 요청 실패: ${response.status}`)
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
  const limit = Math.min(
    Number(requestUrl.searchParams.get('limit') ?? 12),
    30,
  )
  const key = getSteamApiKey()

  if (query.trim().length < 2) {
    sendJson(response, 200, { apps: [] })
    return
  }

  if (!key) {
    sendJson(response, 500, { message: 'STEAM_API_KEY가 없습니다.' })
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
          : 'Steam 앱 목록을 처리하지 못했습니다.',
    })
  }
}

async function handleSteamAchievements(requestUrl, response) {
  const appid = requestUrl.searchParams.get('appid')
  const language = requestUrl.searchParams.get('lang') ?? 'koreana'
  const key = getSteamApiKey()

  if (!appid || !/^\d+$/.test(appid)) {
    sendJson(response, 400, { message: '유효한 appid가 필요합니다.' })
    return
  }

  if (!key) {
    sendJson(response, 500, { message: 'STEAM_API_KEY가 없습니다.' })
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
          : 'Steam API 응답을 처리하지 못했습니다.',
    })
  }
}

loadEnvFile()

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    })
    response.end()
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

  sendJson(response, 404, { message: 'Not Found' })
}).listen(PORT, () => {
  console.log(`Steam proxy server running at http://localhost:${PORT}`)
})
