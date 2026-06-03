export function getNextFullChargeDate(lastFullDate, intervalDays) {
  if (!lastFullDate) return null
  const d = new Date(lastFullDate)
  d.setDate(d.getDate() + intervalDays)
  return d.toISOString().slice(0, 10)
}

export function getDaysUntilNextFullCharge(nextFullChargeDate) {
  if (!nextFullChargeDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(nextFullChargeDate)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function getProgressPercent(lastFullDate, intervalDays) {
  if (!lastFullDate) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(lastFullDate)
  last.setHours(0, 0, 0, 0)
  const daysPassed = Math.round((today - last) / (1000 * 60 * 60 * 24))
  return Math.min(100, Math.round((daysPassed / intervalDays) * 100))
}

export function getRecentLocations(records) {
  const seen = new Set()
  const result = []
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  for (const r of sorted) {
    if (r.location && !seen.has(r.location)) {
      seen.add(r.location)
      result.push(r.location)
    }
    if (result.length === 5) break
  }
  return result
}
