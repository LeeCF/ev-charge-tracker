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

// 相对时间：30天内显示"N天前"，今天显示"今天"，超过30天显示原始日期
export function getRelativeDate(dateStr) {
  if (!dateStr) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((today - target) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff <= 30) return `${diff}天前`
  // 超过30天：显示 MM-DD 或跨年显示 YYYY-MM-DD
  const thisYear = today.getFullYear()
  const targetYear = target.getFullYear()
  if (thisYear === targetYear) {
    return `${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`
  }
  return dateStr
}
