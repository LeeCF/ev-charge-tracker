<template>
  <div class="view">
    <header class="page-header">
      <span class="page-title">设置</span>
    </header>

    <div class="content">
      <section class="section">
        <div class="section-title">电池类型</div>
        <div class="options">
          <button
            v-for="opt in batteryOptions"
            :key="opt.value"
            class="option-btn"
            :class="{ 'option-btn--active': settings.batteryType === opt.value }"
            @click="selectBatteryType(opt.value)"
          >
            <span class="option-name">{{ opt.label }}</span>
            <span class="option-days">{{ opt.days ? `${opt.days} 天` : '自定义' }}</span>
          </button>
        </div>
      </section>

      <section class="section">
        <div class="section-title">满充间隔</div>
        <div class="interval-row">
          <input
            type="number"
            class="field-input"
            v-model.number="settings.fullChargeIntervalDays"
            min="1" max="365"
            :readonly="settings.batteryType !== 'custom'"
            :class="{ 'field-input--readonly': settings.batteryType !== 'custom' }"
          />
          <span class="interval-unit">天</span>
        </div>
      </section>

      <section class="section">
        <div class="section-title">车型名称 <span class="hint">（选填，显示在首页标题）</span></div>
        <input
          type="text"
          class="field-input"
          v-model="settings.vehicleName"
          placeholder="如：比亚迪海豹"
        />
      </section>

      <section class="section section--danger">
        <div class="section-title">数据管理</div>
        <button class="danger-btn" @click="confirmClear">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="2 4 4 4 14 4"/>
            <path d="M13 4l-.7 9a1.5 1.5 0 0 1-1.5 1.4H5.2a1.5 1.5 0 0 1-1.5-1.4L3 4"/>
            <path d="M6.5 4V3a.75.75 0 0 1 .75-.75h1.5A.75.75 0 0 1 9.5 3v1"/>
          </svg>
          清空所有充电记录
        </button>
        <p class="danger-hint">此操作不可撤销，所有记录将被永久删除</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings.js'
import { useRecordsStore } from '../stores/records.js'

const settings = useSettingsStore()
const recordsStore = useRecordsStore()

const batteryOptions = [
  { value: 'lfp', label: '磷酸铁锂', days: 14 },
  { value: 'nmc', label: '三元锂', days: 30 },
  { value: 'custom', label: '自定义', days: null },
]

function selectBatteryType(value) {
  settings.batteryType = value
  const opt = batteryOptions.find(o => o.value === value)
  if (opt.days) settings.fullChargeIntervalDays = opt.days
}

function confirmClear() {
  if (window.confirm('确定要清空所有充电记录吗？此操作不可撤销。')) {
    recordsStore.clearAll()
  }
}
</script>

<style scoped>
.view { min-height: 100%; }

.page-header { padding: 20px 20px 12px; }

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.content { padding: 4px 16px calc(80px + env(safe-area-inset-bottom, 0px)); }

.section { margin-bottom: 28px; }

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
}

.hint {
  font-weight: 400;
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
}

.options { display: flex; flex-direction: column; gap: 8px; }

.option-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  transition: border-color 0.15s, background 0.15s;
}

/* Selected: strong border + slight tint, no green */
.option-btn--active {
  border-color: var(--color-text);
  background: var(--color-surface-2);
}

.option-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.option-days {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.option-btn--active .option-days { color: var(--color-text); font-weight: 600; }

.interval-row { display: flex; align-items: center; gap: 8px; }

.field-input {
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 15px;
  color: var(--color-text);
  background: var(--color-surface);
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

.field-input:focus { border-color: var(--color-border-strong); }

.field-input--readonly {
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.interval-unit {
  font-size: 15px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ── Danger section ─────────────────────────────────── */
.section--danger .section-title { color: var(--color-text-muted); }

.danger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--color-danger);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  color: var(--color-danger);
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s;
  margin-bottom: 8px;
}
.danger-btn:active { background: var(--color-danger-bg); }
.danger-btn svg { width: 16px; height: 16px; flex-shrink: 0; }

.danger-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 0 2px;
}
</style>
