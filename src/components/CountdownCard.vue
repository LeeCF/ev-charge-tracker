<template>
  <div class="card countdown-card">
    <div class="card-label">距下次满充</div>

    <template v-if="days !== null">
      <div class="days-row">
        <span class="days-number" :class="{ 'days-number--overdue': days < 0 }">
          {{ Math.abs(days) }}
        </span>
        <span class="days-unit">天</span>
        <span v-if="days < 0" class="overdue-badge">已超期</span>
      </div>
      <div class="target-date">{{ nextDate }}</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: progress + '%' }" />
      </div>
      <div class="progress-text">已过 {{ daysPassed }} / {{ intervalDays }} 天</div>
    </template>

    <template v-else>
      <div class="empty-hint">尚无满充记录，请先添加一条满充记录</div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRecordsStore } from '../stores/records.js'
import { useSettingsStore } from '../stores/settings.js'

const records = useRecordsStore()
const settings = useSettingsStore()

const days = computed(() => records.daysUntilNextFullCharge)
const nextDate = computed(() => records.nextFullChargeDate)
const progress = computed(() => records.progressPercent)
const intervalDays = computed(() => settings.fullChargeIntervalDays)
const daysPassed = computed(() =>
  Math.min(intervalDays.value, Math.round(progress.value * intervalDays.value / 100))
)
</script>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
}

.card-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.days-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}

.days-number {
  font-size: 48px;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.days-number--overdue { color: var(--color-danger); }

.days-unit {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
}

.overdue-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-danger);
  background: #fee2e2;
  border-radius: 20px;
  padding: 2px 10px;
  margin-left: 4px;
}

.target-date {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.progress-bar-wrap {
  background: var(--color-bg);
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-bar {
  background: linear-gradient(90deg, var(--color-primary), #4ade80);
  height: 6px;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: right;
}

.empty-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 8px 0;
}
</style>
