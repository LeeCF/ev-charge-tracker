<template>
  <div class="hero-card" :class="{ 'hero-card--overdue': hasData && displayDays < 0 }">
    <div class="hero-glow" aria-hidden="true" />

    <div class="hero-body">
      <!-- 左侧：eyebrow + 大数字 + chip -->
      <div class="hero-left">
        <div class="hero-eyebrow">{{ hasData && displayDays < 0 ? '满充已逾期' : '距满充还有' }}</div>
        <div class="hero-number-wrap">
          <span v-if="hasData" class="hero-number" :key="displayDays">{{ Math.abs(displayDays) }}</span>
          <span v-else class="hero-number hero-number--empty">--</span>
          <span class="hero-unit">天</span>
        </div>
        <div class="hero-meta">
          <span class="hero-chip">{{ batteryLabel }}</span>
          <span class="hero-chip">{{ intervalDays }}天周期</span>
        </div>
      </div>

      <!-- 右侧：撕页日历 -->
      <div class="calendar" v-if="nextFullChargeDate">
        <div class="cal-month">
          <span class="cal-month-text">{{ monthLabel }}</span>
        </div>
        <div class="cal-body">
          <div class="cal-tear" aria-hidden="true">
            <span v-for="i in 10" :key="i" />
          </div>
          <div class="cal-day">{{ dayLabel }}</div>
          <div class="cal-label">建议满充</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRecordsStore } from '../stores/records.js'
import { useSettingsStore } from '../stores/settings.js'

const records = useRecordsStore()
const settings = useSettingsStore()

const displayDays = computed(() => records.daysUntilNextFullCharge)
const hasData = computed(() => displayDays.value !== null)
const intervalDays = computed(() => settings.fullChargeIntervalDays)
const nextFullChargeDate = computed(() => records.nextFullChargeDate)

const batteryLabels = { lfp: '磷酸铁锂', nmc: '三元锂', custom: '自定义' }
const batteryLabel = computed(() => batteryLabels[settings.batteryType] ?? '磷酸铁锂')

const MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
const monthLabel = computed(() => {
  if (!nextFullChargeDate.value) return ''
  const m = parseInt(nextFullChargeDate.value.slice(5, 7)) - 1
  return MONTHS[m]
})
const dayLabel = computed(() => {
  if (!nextFullChargeDate.value) return ''
  return nextFullChargeDate.value.slice(8, 10).replace(/^0/, '')
})
</script>

<style scoped>
.hero-card {
  background: var(--color-hero);
  border-radius: var(--radius-hero);
  padding: 20px 18px 18px;
  margin: 0 0 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(5, 15, 40, 0.45);
}

/* 微噪点纹理叠加层 — 防止大面积深色显得廉价 */
.hero-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  opacity: 0.035;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.hero-glow {
  position: absolute;
  top: -50px;
  right: -30px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(0,100,255,0.2), transparent 60%);
  pointer-events: none;
}

.hero-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
}

.hero-left { flex: 1; min-width: 0; }

.hero-eyebrow {
  font-size: 10px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  font-family: var(--font-body);
  margin-bottom: 8px;
}

.hero-number-wrap {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 16px;
  overflow: hidden;
}

.hero-number {
  font-size: 80px;
  font-weight: 400;
  color: white;
  line-height: 0.9;
  letter-spacing: 2px;
  font-family: var(--font-hero);
  animation: slot-in 0.4s ease-in-out;
}

.hero-unit {
  font-size: 22px;
  font-weight: 300;
  color: rgba(255,255,255,0.4);
  font-family: var(--font-body);
  margin-bottom: 4px;
}

.hero-number--empty {
  font-size: 60px;
  letter-spacing: 0;
  color: rgba(255,255,255,0.3);
}

.hero-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hero-chip {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-chip);
  padding: 4px 11px;
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  font-weight: 400;
  font-family: var(--font-body);
}

.hero-card--overdue .hero-chip {
  background: rgba(239,68,68,0.18);
  border-color: rgba(239,68,68,0.3);
  color: rgba(255,180,180,0.85);
}

/* ── 撕页日历 ── */
.calendar {
  flex-shrink: 0;
  width: 76px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  box-shadow: 0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
}

.cal-month {
  background: linear-gradient(135deg, #0055E0 0%, #0088FF 100%);
  padding: 6px 0 5px;
  text-align: center;
}

.cal-month-text {
  font-size: 11px;
  font-weight: 600;
  color: white;
  letter-spacing: 2px;
  font-family: var(--font-body);
  text-transform: uppercase;
}

.cal-body {
  padding: 6px 0 10px;
  text-align: center;
}

/* 撕裂锯齿 */
.cal-tear {
  display: flex;
  justify-content: space-around;
  padding: 0 4px;
  margin-bottom: 6px;
}
.cal-tear span {
  width: 1px;
  height: 5px;
  background: rgba(255,255,255,0.07);
}

.cal-day {
  font-family: var(--font-hero);
  font-size: 44px;
  font-weight: 400;
  color: white;
  line-height: 1;
  letter-spacing: 1px;
}

.cal-label {
  font-size: 9px;
  color: rgba(100,170,255,0.6);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 5px;
  font-family: var(--font-body);
}

@keyframes slot-in {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
</style>
