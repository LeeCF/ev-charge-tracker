import { describe, it, expect } from 'vitest'
import {
  getNextFullChargeDate,
  getDaysUntilNextFullCharge,
  getProgressPercent,
  getRecentLocations,
} from '../../src/utils/charging.js'

describe('getNextFullChargeDate', () => {
  it('上次满充日期加上间隔天数', () => {
    expect(getNextFullChargeDate('2025-06-01', 14)).toBe('2025-06-15')
  })

  it('跨月计算正确', () => {
    expect(getNextFullChargeDate('2025-06-25', 14)).toBe('2025-07-09')
  })

  it('没有满充记录时返回 null', () => {
    expect(getNextFullChargeDate(null, 14)).toBeNull()
  })
})

describe('getDaysUntilNextFullCharge', () => {
  it('返回正数表示还有几天', () => {
    const result = getDaysUntilNextFullCharge('2099-12-31')
    expect(result).toBeGreaterThan(0)
  })

  it('返回负数表示已超期', () => {
    const result = getDaysUntilNextFullCharge('2000-01-01')
    expect(result).toBeLessThan(0)
  })

  it('今天到期返回 0', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(getDaysUntilNextFullCharge(today)).toBe(0)
  })

  it('nextFullChargeDate 为 null 时返回 null', () => {
    expect(getDaysUntilNextFullCharge(null)).toBeNull()
  })
})

describe('getProgressPercent', () => {
  it('第 7 天是 50%', () => {
    const lastFullDate = offsetDate(-7)
    expect(getProgressPercent(lastFullDate, 14)).toBe(50)
  })

  it('第 0 天是 0%', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(getProgressPercent(today, 14)).toBe(0)
  })

  it('超过间隔天数时上限为 100%', () => {
    const lastFullDate = offsetDate(-20)
    expect(getProgressPercent(lastFullDate, 14)).toBe(100)
  })

  it('lastFullDate 为 null 时返回 0', () => {
    expect(getProgressPercent(null, 14)).toBe(0)
  })
})

describe('getRecentLocations', () => {
  it('返回最近 5 个不重复地点，按最新优先', () => {
    const records = [
      { date: '2025-06-01', location: '家' },
      { date: '2025-06-02', location: '公司' },
      { date: '2025-06-03', location: '超市' },
      { date: '2025-06-04', location: '商场' },
      { date: '2025-06-05', location: '高速服务区' },
      { date: '2025-06-06', location: '朋友家' },
    ]
    const result = getRecentLocations(records)
    expect(result).toHaveLength(5)
    expect(result[0]).toBe('朋友家')
    expect(result).not.toContain('家')
  })

  it('过滤掉空地点', () => {
    const records = [
      { date: '2025-06-01', location: '' },
      { date: '2025-06-02', location: '家' },
    ]
    expect(getRecentLocations(records)).toEqual(['家'])
  })

  it('空数组返回空数组', () => {
    expect(getRecentLocations([])).toEqual([])
  })
})

function offsetDate(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
