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
      location: data.location ?? '',
      note: data.note ?? '',
      createdAt: Date.now(),
    }
    records.value.unshift(record)
    saveRecords(records.value)
  }

  function deleteRecord(id) {
    records.value = records.value.filter(r => r.id !== id)
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

  load()

  return {
    records,
    sortedRecords,
    lastFullRecord,
    nextFullChargeDate,
    daysUntilNextFullCharge,
    progressPercent,
    recentLocations,
    addRecord,
    deleteRecord,
  }
})
