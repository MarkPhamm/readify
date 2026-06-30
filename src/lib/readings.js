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

function resolveUrl(base, candidate) {
  if (!candidate) return ''
  try {
    return new URL(candidate, base).href
  } catch {
    return candidate
  }
}

function extractMetaContent(html, keys) {
  for (const key of keys) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) return decodeEntities(match[1].trim())
    }
  }

  return ''
}

export function extractPageMetadata(html, pageUrl) {
  const title =
    extractMetaContent(html, ['og:title', 'twitter:title']) ||
    (() => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      return match?.[1] ? decodeEntities(match[1].trim()) : ''
    })()

  const hero = resolveUrl(
    pageUrl,
    extractMetaContent(html, ['og:image', 'twitter:image']),
  )

  const description = extractMetaContent(html, [
    'og:description',
    'twitter:description',
    'description',
  ])

  return { title, hero, description }
}

async function fetchHtml(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (response.ok) return await response.text()
  } catch {
    // direct fetch often blocked by CORS in the browser
  }

  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error('Could not fetch page metadata')
  return await response.text()
}

export async function fetchPageMetadata(url) {
  try {
    const html = await fetchHtml(url)
    return extractPageMetadata(html, url)
  } catch {
    return { title: '', hero: '', description: '' }
  }
}

export async function fetchTitle(url) {
  const metadata = await fetchPageMetadata(url)
  return metadata.title
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
