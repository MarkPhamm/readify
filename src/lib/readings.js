export { formatDate } from './dates'

const STORAGE_KEY = 'readify-readings'

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
    // Grab the whole <meta> tag referencing this key (attribute order agnostic)…
    const tag = html.match(
      new RegExp(`<meta\\b[^>]*\\b(?:property|name)=["']${key}["'][^>]*>`, 'i'),
    )?.[0]
    if (!tag) continue

    // …then read its content value, matching the quote style so an apostrophe or
    // quote inside the value doesn't truncate it (e.g. The 'lost boarding pass'…).
    const content = tag.match(/\bcontent=(?:"([^"]*)"|'([^']*)')/i)
    const value = content?.[1] ?? content?.[2]
    if (value) return decodeEntities(value.trim())
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

// A browser can't fetch other origins directly (CORS), so we route through a
// chain of public CORS proxies. Any single one is flaky (rate limits, timeouts,
// slow on redirects), so we try them in order until one returns the real HTML.
const PROXIES = [
  { build: (url) => url, timeout: 7000 }, // direct — works for CORS-enabled pages
  { build: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, timeout: 12000 },
  { build: (url) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`, timeout: 12000 },
  { build: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`, timeout: 12000 },
]

async function fetchViaProxy(proxiedUrl, timeout) {
  const response = await fetch(proxiedUrl, { signal: AbortSignal.timeout(timeout) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()
  // Proxy error bodies are tiny; a real page is large. Reject the junk.
  if (html.length < 500) throw new Error('empty response')
  return html
}

function metaScore(meta) {
  return (meta.title ? 1 : 0) + (meta.hero ? 2 : 0) + (meta.description ? 1 : 0)
}

export async function fetchPageMetadata(url) {
  let best = { title: '', hero: '', description: '' }

  for (const proxy of PROXIES) {
    try {
      const html = await fetchViaProxy(proxy.build(url), proxy.timeout)
      const meta = extractPageMetadata(html, url)
      // A proxy that returns real HTML gives deterministic metadata, so the
      // first one with a title or image is our answer — stop early.
      if (meta.title || meta.hero) return meta
      if (metaScore(meta) > metaScore(best)) best = meta
    } catch {
      // this proxy failed — try the next one
    }
  }

  return best
}

export async function fetchTitle(url) {
  const metadata = await fetchPageMetadata(url)
  return metadata.title
}

function readingKey(reading) {
  return `${reading.date}|${reading.url}`
}

// Stable id for a reading. New entries get a random id; legacy entries stored
// before ids existed fall back to their natural date|url key so edit/delete
// still target the right row.
export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

function withId(reading) {
  return reading.id ? reading : { ...reading, id: readingKey(reading) }
}

export function mergeReadings(base, local) {
  const seen = new Set()
  const merged = []

  for (const [source, list] of [['base', base], ['local', local]]) {
    for (const reading of list) {
      const key = readingKey(reading)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push({ ...withId(reading), source })
    }
  }

  return merged
}

export function loadLocalReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(withId)
  } catch {
    return []
  }
}

export function saveLocalReadings(readings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings))
}

export function addLocalReading(entry) {
  const current = loadLocalReadings()
  const next = [...current, { ...entry, id: entry.id ?? newId() }]
  saveLocalReadings(next)
  return next
}

export function updateLocalReading(id, patch) {
  const current = loadLocalReadings()
  const next = current.map((reading) =>
    reading.id === id ? { ...reading, ...patch, id } : reading,
  )
  saveLocalReadings(next)
  return next
}

export function deleteLocalReading(id) {
  const next = loadLocalReadings().filter((reading) => reading.id !== id)
  saveLocalReadings(next)
  return next
}

// The documented data/readings.json schema (no runtime-only id/source fields).
const EXPORT_FIELDS = ['date', 'url', 'title', 'hero', 'description', 'tags', 'note']

// Clean readings into JSON ready to paste into data/readings.json — drops the
// runtime-only `id`/`source` fields and keeps just the documented schema.
export function serializeReadings(readings) {
  const cleaned = readings.map((reading) => {
    const out = {}
    for (const key of EXPORT_FIELDS) {
      if (reading[key] !== undefined) out[key] = reading[key]
    }
    return out
  })
  return JSON.stringify(cleaned, null, 2)
}

// Merge an imported JSON array into localStorage (dedupe by date|url), returning
// the new local list. Throws on invalid JSON or a non-array payload.
export function importLocalReadings(json) {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of readings.')

  const current = loadLocalReadings()
  const seen = new Set(current.map(readingKey))
  const merged = [...current]

  for (const entry of parsed) {
    if (!entry || typeof entry.date !== 'string' || typeof entry.url !== 'string') continue
    const key = readingKey(entry)
    if (seen.has(key)) continue
    seen.add(key)
    merged.push({ ...entry, id: entry.id ?? newId() })
  }

  saveLocalReadings(merged)
  return merged
}
