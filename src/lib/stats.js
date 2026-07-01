import { addDays, daysBetween, formatDate, parseDate } from './dates'

export function byDay(readings) {
  const map = new Map()

  for (const reading of readings) {
    const existing = map.get(reading.date) ?? { count: 0, entries: [] }
    existing.count += 1
    existing.entries.push(reading)
    map.set(reading.date, existing)
  }

  return map
}

export function countToLevel(count) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

export function toCalendarData(readings) {
  const dayMap = byDay(readings)
  const dates = [...dayMap.keys()].map(parseDate)

  const today = new Date()
  let start = addDays(today, -364)
  let end = today

  if (dates.length > 0) {
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))
    if (minDate < start) start = minDate
    if (maxDate > end) end = maxDate
  }

  const result = []
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const key = formatDate(cursor)
    const day = dayMap.get(key)
    const count = day?.count ?? 0
    result.push({
      date: key,
      count,
      level: countToLevel(count),
    })
  }

  return result
}

export function dailySeries(readings, days = 30) {
  const dayMap = byDay(readings)
  const today = new Date()
  const series = []

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = addDays(today, -i)
    const key = formatDate(day)
    series.push({ date: key, count: dayMap.get(key)?.count ?? 0 })
  }

  return series
}

export function totalReads(readings) {
  return readings.length
}

export function uniqueTags(readings) {
  const tags = new Set()
  for (const reading of readings) {
    for (const tag of reading.tags ?? []) {
      tags.add(tag)
    }
  }
  return tags.size
}

export function topTags(readings, limit = 10) {
  const counts = new Map()
  for (const reading of readings) {
    for (const tag of reading.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}

function sortedActiveDates(readings) {
  return [...byDay(readings).keys()].sort()
}

export function longestStreak(readings) {
  const dates = sortedActiveDates(readings)
  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i += 1) {
    const prev = parseDate(dates[i - 1])
    const curr = parseDate(dates[i])
    if (daysBetween(prev, curr) === 1) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

export function currentStreak(readings) {
  const dates = sortedActiveDates(readings)
  if (dates.length === 0) return 0

  const today = formatDate(new Date())
  const yesterday = formatDate(addDays(new Date(), -1))
  const lastActive = dates[dates.length - 1]

  if (lastActive !== today && lastActive !== yesterday) {
    return 0
  }

  let streak = 1
  for (let i = dates.length - 2; i >= 0; i -= 1) {
    const prev = parseDate(dates[i])
    const curr = parseDate(dates[i + 1])
    if (daysBetween(prev, curr) === 1) {
      streak += 1
    } else {
      break
    }
  }

  return streak
}

export function filterByTag(readings, tag) {
  if (!tag) return readings
  return readings.filter((reading) => (reading.tags ?? []).includes(tag))
}

export function searchReadings(readings, query) {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return readings

  return readings.filter((reading) => {
    const haystack = [
      reading.title,
      reading.description,
      reading.note,
      reading.url,
      ...(reading.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(trimmed)
  })
}

export function sortReadingsNewestFirst(readings) {
  return [...readings].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.url.localeCompare(a.url)
  })
}
