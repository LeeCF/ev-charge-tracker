// Parse a YYYY-MM-DD string as local midnight to avoid UTC offset shifting the calendar date.
function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Format a Date object to YYYY-MM-DD in local time (never uses toISOString which is UTC).
function formatLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getNextFullChargeDate(lastFullDate, intervalDays) {
  if (!lastFullDate) return null
  const d = parseLocalDate(lastFullDate)
  d.setDate(d.getDate() + intervalDays)
  return formatLocalDate(d)
}

export function getDaysUntilNextFullCharge(nextFullChargeDate) {
  if (!nextFullChargeDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseLocalDate(nextFullChargeDate)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function getProgressPercent(lastFullDate, intervalDays) {
  if (!lastFullDate || !intervalDays || intervalDays <= 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = parseLocalDate(lastFullDate)
  const daysPassed = Math.round((today - last) / (1000 * 60 * 60 * 24))
  return Math.min(100, Math.round((daysPassed / intervalDays) * 100))
}

export function getRecentLocations(records) {
  const seen = new Set()
  const result = []
  const sorted = [...records].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  for (const r of sorted) {
    if (r.location && !seen.has(r.location)) {
      seen.add(r.location)
      result.push(r.location)
    }
    if (result.length === 5) break
  }
  return result
}
