import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadRecords, saveRecords } from '../utils/storage.js'
import { generateId } from '../utils/uuid.js'
import {
  getNextFullChargeDate,
  getDaysUntilNextFullCharge,
  getProgressPercent,
  getRecentLocations,
} from '../utils/charging.js'
import { useSettingsStore } from './settings.js'

export const useRecordsStore = defineStore('records', () => {
  const records = ref([])
  const lastAddedId = ref(null)  // 最新添加的记录 id，用于触发飞入动画

  function load() {
    records.value = loadRecords()
  }

  function addRecord(data) {
    const record = {
      id: generateId(),
      date: data.date,
      type: data.type,
      isFull: data.isFull,
      endSoc: data.isFull ? 100 : (data.endSoc ?? 80),
      cost: data.cost != null && data.cost !== '' ? Number(data.cost) : null,
      location: data.location ?? '',
      note: data.note ?? '',
      createdAt: Date.now(),
    }
    records.value.unshift(record)
    saveRecords(records.value)
    lastAddedId.value = record.id
    return record.id
  }

  function deleteRecord(id) {
    records.value = records.value.filter(r => r.id !== id)
    saveRecords(records.value)
  }

  function clearAll() {
    records.value = []
    saveRecords(records.value)
  }

  const sortedRecords = computed(() =>
    [...records.value].sort((a, b) => b.date.localeCompare(a.date))
  )

  const lastFullRecord = computed(() =>
    sortedRecords.value.find(r => r.isFull) ?? null
  )

  const nextFullChargeDate = computed(() => {
    const settings = useSettingsStore()
    return getNextFullChargeDate(
      lastFullRecord.value?.date ?? null,
      settings.fullChargeIntervalDays
    )
  })

  const daysUntilNextFullCharge = computed(() =>
    getDaysUntilNextFullCharge(nextFullChargeDate.value)
  )

  const progressPercent = computed(() => {
    const settings = useSettingsStore()
    return getProgressPercent(
      lastFullRecord.value?.date ?? null,
      settings.fullChargeIntervalDays
    )
  })

  const recentLocations = computed(() =>
    getRecentLocations(records.value)
  )

  // Returns [{ label: 'YYYY-MM', total: number }, ...] sorted newest first, only records with cost
  const monthlyCosts = computed(() => {
    const map = {}
    for (const r of records.value) {
      if (r.cost == null) continue
      const month = r.date.slice(0, 7)
      map[month] = (map[month] ?? 0) + r.cost
    }
    return Object.entries(map)
      .map(([label, total]) => ({ label, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.label.localeCompare(a.label))
  })

  // Returns [{ label: 'YYYY', total: number }, ...] sorted newest first, only records with cost
  const yearlyCosts = computed(() => {
    const map = {}
    for (const r of records.value) {
      if (r.cost == null) continue
      const year = r.date.slice(0, 4)
      map[year] = (map[year] ?? 0) + r.cost
    }
    return Object.entries(map)
      .map(([label, total]) => ({ label, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.label.localeCompare(a.label))
  })

  load()

  return {
    records,
    lastAddedId,
    sortedRecords,
    lastFullRecord,
    nextFullChargeDate,
    daysUntilNextFullCharge,
    progressPercent,
    recentLocations,
    monthlyCosts,
    yearlyCosts,
    addRecord,
    deleteRecord,
    clearAll,
  }
})
