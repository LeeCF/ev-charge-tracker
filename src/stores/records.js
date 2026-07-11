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
  const settings = useSettingsStore()

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

  function updateRecord(id, data) {
    const idx = records.value.findIndex(r => r.id === id)
    if (idx === -1) return
    records.value[idx] = {
      ...records.value[idx],
      date: data.date,
      type: data.type,
      isFull: data.isFull,
      endSoc: data.isFull ? 100 : (data.endSoc ?? 80),
      cost: data.cost != null && data.cost !== '' ? Number(data.cost) : null,
      location: data.location ?? '',
      note: data.note ?? '',
      pendingDelete: undefined,  // never persist transient UI state
    }
    saveRecords(records.value)
  }

  // Transient UI state — intentionally not persisted. If page reloads during
  // the undo window the deletion is cancelled (record survives), which is safe.
  function markPendingDelete(id) {
    const record = records.value.find(r => r.id === id)
    if (record) record.pendingDelete = true
  }

  function restoreRecord(id) {
    const record = records.value.find(r => r.id === id)
    if (record) delete record.pendingDelete
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
    [...records.value].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  )

  const lastFullRecord = computed(() =>
    sortedRecords.value.find(r => r.isFull) ?? null
  )

  const nextFullChargeDate = computed(() =>
    getNextFullChargeDate(
      lastFullRecord.value?.date ?? null,
      settings.fullChargeIntervalDays
    )
  )

  const daysUntilNextFullCharge = computed(() =>
    getDaysUntilNextFullCharge(nextFullChargeDate.value)
  )

  const progressPercent = computed(() =>
    getProgressPercent(
      lastFullRecord.value?.date ?? null,
      settings.fullChargeIntervalDays
    )
  )

  const recentLocations = computed(() =>
    getRecentLocations(records.value)
  )

  // Returns [{ label: 'YYYY-MM', total: number }, ...] sorted newest first, only records with cost
  const monthlyCosts = computed(() => {
    const map = {}
    for (const r of records.value) {
      if (r.cost == null || !r.date) continue
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
      if (r.cost == null || !r.date) continue
      const year = r.date.slice(0, 4)
      map[year] = (map[year] ?? 0) + r.cost
    }
    return Object.entries(map)
      .map(([label, total]) => ({ label, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.label.localeCompare(a.label))
  })

  load()

  const editingRecordId = ref(null)  // App.vue watch 此值来打开编辑弹窗

  function requestEdit(id) {
    editingRecordId.value = id
  }

  function clearEditingId() {
    editingRecordId.value = null
  }

  return {
    records,
    lastAddedId,
    editingRecordId,
    sortedRecords,
    lastFullRecord,
    nextFullChargeDate,
    daysUntilNextFullCharge,
    progressPercent,
    recentLocations,
    monthlyCosts,
    yearlyCosts,
    addRecord,
    updateRecord,
    deleteRecord,
    markPendingDelete,
    restoreRecord,
    requestEdit,
    clearEditingId,
    clearAll,
  }
})
