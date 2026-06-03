<template>
  <div class="view">
    <header class="page-header">
      <span class="page-title">设置</span>
    </header>

    <div class="content">
      <!-- 电池类型 -->
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

      <!-- 满充间隔 -->
      <section class="section">
        <div class="section-title">满充间隔</div>
        <div class="interval-row">
          <input
            type="number"
            class="field-input"
            v-model.number="settings.fullChargeIntervalDays"
            min="1"
            max="365"
            :readonly="settings.batteryType !== 'custom'"
            :class="{ 'field-input--readonly': settings.batteryType !== 'custom' }"
          />
          <span class="interval-unit">天</span>
        </div>
      </section>

      <!-- 车型名称 -->
      <section class="section">
        <div class="section-title">车型名称 <span class="hint">（选填，显示在首页标题）</span></div>
        <input
          type="text"
          class="field-input"
          v-model="settings.vehicleName"
          placeholder="如：比亚迪海豹"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings.js'

const settings = useSettingsStore()

const batteryOptions = [
  { value: 'lfp', label: '磷酸铁锂', days: 14 },
  { value: 'nmc', label: '三元锂', days: 30 },
  { value: 'custom', label: '自定义', days: null },
]

function selectBatteryType(value) {
  settings.batteryType = value
  const opt = batteryOptions.find(o => o.value === value)
  if (opt.days) {
    settings.fullChargeIntervalDays = opt.days
  }
}
</script>

<style scoped>
.view { min-height: 100%; }

.page-header { padding: 16px 16px 8px; }

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.content { padding: 8px 16px 80px; }

.section { margin-bottom: 24px; }

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.hint {
  font-weight: 400;
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
}

.options { display: flex; flex-direction: column; gap: 8px; }

.option-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  transition: all 0.15s;
}

.option-btn--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.option-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.option-btn--active .option-name { color: var(--color-primary-text); }

.option-days {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.option-btn--active .option-days { color: var(--color-primary-text); }

.interval-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 15px;
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
  width: 100%;
}

.field-input:focus { border-color: var(--color-primary); }

.field-input--readonly {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.interval-unit {
  font-size: 15px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
</style>
