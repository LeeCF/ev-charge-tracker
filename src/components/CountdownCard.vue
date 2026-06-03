<template>
  <div class="countdown-card" :class="{ 'countdown-card--overdue': days !== null && days < 0 }">

    <!-- Empty state -->
    <template v-if="days === null">
      <div class="empty-wrap">
        <div class="empty-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
            <path d="M20 12v8l5 3" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="empty-title">尚无满充记录</p>
        <p class="empty-sub">点击右下角 + 添加第一条记录</p>
      </div>
    </template>

    <!-- Countdown -->
    <template v-else>
      <div class="card-eyebrow">距下次满充</div>

      <div class="days-hero">
        <span class="days-number">{{ Math.abs(days) }}</span>
        <div class="days-right">
          <span class="days-unit">天</span>
          <span v-if="days < 0" class="status-pill status-pill--overdue">已超期</span>
          <span v-else-if="days <= 3" class="status-pill status-pill--urgent">即将到期</span>
        </div>
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

    <div class="deco-circle deco-1" />
    <div class="deco-circle deco-2" />
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
  /* subtle ring for premium lift */
  box-shadow:
    0 1px 0 rgba(255,255,255,0.06) inset,
    0 8px 32px rgba(0,0,0,0.22);
}

.countdown-card--overdue {
  background: linear-gradient(150deg, #1a0a0a 0%, #2d1111 55%, #3b0f0f 100%);
}

/* Decorative circles — feel of depth without color distraction */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.deco-1 {
  width: 200px; height: 200px;
  border: 1px solid rgba(255,255,255,0.04);
  top: -80px; right: -60px;
}
.deco-2 {
  width: 120px; height: 120px;
  border: 1px solid rgba(255,255,255,0.03);
  bottom: -40px; left: 20px;
}

/* Empty */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 8px;
  position: relative;
  z-index: 1;
}
.empty-icon { width: 48px; height: 48px; margin-bottom: 12px; }
.empty-title { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.85); margin-bottom: 4px; }
.empty-sub { font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; }

/* Eyebrow */
.card-eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

/* Days hero — THE focal point, accent green on dark = premium */
.days-hero {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}
.days-number {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: #4ade80;           /* bright green, pops on dark */
  letter-spacing: -3px;
  font-variant-numeric: tabular-nums;
}
.countdown-card--overdue .days-number { color: #f87171; }

.days-right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding-bottom: 8px;
}
.days-unit {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
}
.status-pill {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 3px 10px;
  border-radius: 20px;
}
.status-pill--overdue {
  background: rgba(248, 113, 113, 0.2);
  color: #fca5a5;
}
.status-pill--urgent {
  background: rgba(251, 191, 36, 0.2);
  color: #fcd34d;
}

/* Target date */
.target-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
}
.target-row svg {
  width: 13px; height: 13px;
  opacity: 0.5;
  flex-shrink: 0;
}

/* Progress */
.progress-section { position: relative; z-index: 1; }
.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  margin-bottom: 6px;
}
.progress-pct {
  font-weight: 600;
  color: rgba(255,255,255,0.5);
}
.progress-track {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: rgba(74, 222, 128, 0.6);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.countdown-card--overdue .progress-fill {
  background: rgba(248, 113, 113, 0.6);
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}
</style>
