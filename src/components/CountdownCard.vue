<template>
  <div class="countdown-card" :class="{ 'countdown-card--overdue': days !== null && days < 0 }">

    <!-- Empty state -->
    <template v-if="days === null">
      <div class="empty-wrap">
        <div class="gauge-ring gauge-ring--empty">
          <svg viewBox="0 0 80 80" class="gauge-svg">
            <circle cx="40" cy="40" r="32" class="gauge-track" />
            <circle cx="40" cy="40" r="32" class="gauge-fill gauge-fill--empty" stroke-dasharray="0 201" />
          </svg>
          <div class="gauge-inner">
            <span class="gauge-dash">—</span>
          </div>
        </div>
        <p class="empty-title">尚无满充记录</p>
        <p class="empty-sub">点击右下角 + 添加第一条记录</p>
      </div>
    </template>

    <!-- Countdown -->
    <template v-else>
      <!-- Tick marks grid -->
      <div class="tick-grid" aria-hidden="true">
        <span v-for="i in 20" :key="i" class="tick" :class="{ 'tick--lit': i <= Math.ceil(progress / 5) }" />
      </div>

      <div class="card-top">
        <div class="card-eyebrow">距下次满充</div>
        <span v-if="days < 0" class="status-pill status-pill--overdue">已超期</span>
        <span v-else-if="days <= 3" class="status-pill status-pill--urgent">即将到期</span>
      </div>

      <div class="days-hero">
        <span class="days-number">{{ Math.abs(days) }}</span>
        <span class="days-unit">天</span>
      </div>

      <div class="target-row">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <rect x="1" y="2" width="12" height="11" rx="1.5"/>
          <line x1="9.5" y1="0.5" x2="9.5" y2="3.5"/>
          <line x1="4.5" y1="0.5" x2="4.5" y2="3.5"/>
          <line x1="1" y1="6" x2="13" y2="6"/>
        </svg>
        <span>{{ days < 0 ? '应于 ' + nextDate + ' 满充' : '目标 ' + nextDate }}</span>
      </div>

      <div class="progress-section">
        <div class="progress-header">
          <span>已过 {{ daysPassed }} 天</span>
          <span class="progress-pct">{{ progress }}%</span>
          <span>{{ intervalDays }} 天周期</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }" />
        </div>
      </div>
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
.countdown-card {
  background: var(--gradient-hero);
  border-radius: var(--radius-card-lg);
  padding: 22px 20px 20px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 0 rgba(255,255,255,0.04) inset, 0 8px 36px rgba(0,0,0,0.28);
}

.countdown-card--overdue {
  background: linear-gradient(145deg, #1a0505 0%, #2d0f0f 50%, #3b0505 100%);
}

/* Tick mark grid — the signature element */
.tick-grid {
  position: absolute;
  top: 18px;
  right: 20px;
  display: grid;
  grid-template-columns: repeat(5, 8px);
  grid-template-rows: repeat(4, 8px);
  gap: 4px;
}

.tick {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: rgba(255,255,255,0.06);
  transition: background 0.3s;
}

.tick--lit {
  background: rgba(0, 140, 255, 0.45);
  box-shadow: 0 0 4px rgba(0, 140, 255, 0.3);
}

.countdown-card--overdue .tick--lit {
  background: rgba(255, 80, 80, 0.45);
  box-shadow: 0 0 4px rgba(255, 80, 80, 0.3);
}

/* Empty state */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 10px;
}

.gauge-ring {
  position: relative;
  width: 80px;
  height: 80px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-track {
  fill: none;
  stroke: rgba(255,255,255,0.08);
  stroke-width: 4;
}

.gauge-fill {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1);
}

.gauge-fill--empty {
  stroke: rgba(255,255,255,0.12);
}

.gauge-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-dash {
  font-family: var(--font-display);
  font-size: 22px;
  color: rgba(255,255,255,0.2);
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  font-family: var(--font-body);
}

.empty-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  text-align: center;
}

/* Card top row */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.card-eyebrow {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  font-family: var(--font-body);
}

/* Days hero — Syne display font, THE focal point */
.days-hero {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
  line-height: 1;
}

.days-number {
  font-family: var(--font-display);
  font-size: 80px;
  font-weight: 800;
  line-height: 0.9;
  color: #5599FF;
  letter-spacing: -4px;
  font-variant-numeric: tabular-nums;
}

.countdown-card--overdue .days-number { color: #FF7070; }

.days-unit {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  padding-bottom: 10px;
}

/* Status pills */
.status-pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  font-family: var(--font-body);
}

.status-pill--overdue {
  background: rgba(255, 80, 80, 0.18);
  color: #FF9999;
  border: 1px solid rgba(255, 80, 80, 0.3);
}

.status-pill--urgent {
  background: rgba(255, 180, 0, 0.15);
  color: #FFD060;
  border: 1px solid rgba(255, 180, 0, 0.3);
}

/* Target date */
.target-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 12px;
  color: rgba(255,255,255,0.38);
  font-family: var(--font-body);
}

.target-row svg {
  width: 12px;
  height: 12px;
  opacity: 0.4;
  flex-shrink: 0;
}

/* Progress */
.progress-section {}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  margin-bottom: 7px;
  font-family: var(--font-body);
  letter-spacing: 0.3px;
}

.progress-pct {
  font-weight: 600;
  color: rgba(255,255,255,0.45);
  font-family: var(--font-display);
  font-size: 11px;
}

.progress-track {
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: rgba(85, 153, 255, 0.7);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.countdown-card--overdue .progress-fill {
  background: rgba(255, 112, 112, 0.7);
}
</style>
