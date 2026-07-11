import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { loadSettings, saveSettings } from '../utils/storage.js'

export const useSettingsStore = defineStore('settings', () => {
  const batteryType = ref('lfp')
  const fullChargeIntervalDays = ref(14)
  const vehicleName = ref('')

  function load() {
    const s = loadSettings()
    batteryType.value = s.batteryType ?? 'lfp'
    fullChargeIntervalDays.value = s.fullChargeIntervalDays ?? 14
    vehicleName.value = s.vehicleName ?? ''
  }

  function save() {
    saveSettings({
      batteryType: batteryType.value,
      fullChargeIntervalDays: fullChargeIntervalDays.value,
      vehicleName: vehicleName.value,
    })
  }

  watch([batteryType, fullChargeIntervalDays, vehicleName], save)

  load()

  return { batteryType, fullChargeIntervalDays, vehicleName, load }
})
