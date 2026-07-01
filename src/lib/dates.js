// Shared date helpers. All dates in the app are YYYY-MM-DD strings interpreted
// in the user's local timezone (never UTC-shifted), so a reading logged "today"
// always lands on today's calendar cell.

export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcB - utcA) / msPerDay)
}
