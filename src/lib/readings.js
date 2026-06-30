const STORAGE_KEY = 'readify-readings'

export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isValidUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function extractTitle(html) {
  const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
  if (ogMatch?.[1]) return decodeEntities(ogMatch[1].trim())

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch?.[1]) return decodeEntities(titleMatch[1].trim())

  return ''
}

export async function fetchTitle(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return ''
    const html = await response.text()
    return extractTitle(html)
  } catch {
    return ''
  }
}

function readingKey(reading) {
  return `${reading.date}|${reading.url}`
}

export function mergeReadings(base, local) {
  const seen = new Set()
  const merged = []

  for (const reading of [...base, ...local]) {
    const key = readingKey(reading)
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(reading)
  }

  return merged
}

export function loadLocalReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalReadings(readings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings))
}

export function addLocalReading(entry) {
  const current = loadLocalReadings()
  const next = [...current, entry]
  saveLocalReadings(next)
  return next
}
