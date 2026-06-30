#!/usr/bin/env node

import { createInterface } from 'node:readline/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../data/readings.json')

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isValidUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function extractTitle(html) {
  const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
  if (ogMatch?.[1]) return decodeEntities(ogMatch[1].trim())

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch?.[1]) return decodeEntities(titleMatch[1].trim())

  return ''
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

async function fetchTitle(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Readify/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return ''
    const html = await response.text()
    return extractTitle(html)
  } catch {
    return ''
  }
}

async function loadReadings() {
  const raw = await readFile(dataPath, 'utf8')
  return JSON.parse(raw)
}

async function saveReadings(readings) {
  const sorted = [...readings].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.url.localeCompare(b.url)
  })
  await writeFile(dataPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
}

async function main() {
  const rl = createInterface({ input, output })

  try {
    const urlInput = (await rl.question('URL: ')).trim()
    if (!isValidUrl(urlInput)) {
      console.error('Please enter a valid http(s) URL.')
      process.exitCode = 1
      return
    }

    const dateInput = (await rl.question(`Date [${formatDate(new Date())}]: `)).trim()
    const date = dateInput || formatDate(new Date())

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Date must be in YYYY-MM-DD format.')
      process.exitCode = 1
      return
    }

    const tagsInput = (await rl.question('Tags (comma-separated): ')).trim()
    const tags = tagsInput
      ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
      : []

    const note = (await rl.question('Note (optional): ')).trim()

    console.log('Fetching page title...')
    const fetchedTitle = await fetchTitle(urlInput)
    const titlePrompt = fetchedTitle
      ? `Title [${fetchedTitle}]: `
      : 'Title (optional): '
    const titleInput = (await rl.question(titlePrompt)).trim()
    const title = titleInput || fetchedTitle

    const readings = await loadReadings()
    readings.push({
      date,
      url: urlInput,
      title,
      tags,
      note,
    })

    await saveReadings(readings)
    console.log(`Added reading for ${date}. Commit data/readings.json to update your graph.`)
  } finally {
    rl.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
