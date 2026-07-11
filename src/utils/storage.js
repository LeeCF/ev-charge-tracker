const RECORDS_KEY = 'ev_charge_records'
const SETTINGS_KEY = 'ev_charge_settings'

export function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  } catch {
    console.warn('[storage] Failed to save records — storage may be full or restricted.')
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : defaultSettings()
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    console.warn('[storage] Failed to save settings — storage may be full or restricted.')
  }
}

function defaultSettings() {
  return {
    batteryType: 'lfp',
    fullChargeIntervalDays: 14,
    vehicleName: '',
  }
}
