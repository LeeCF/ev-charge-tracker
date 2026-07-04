<template>
  <div class="hero-card" :class="{ 'hero-card--overdue': hasData && displayDays < 0 }">
    <div class="hero-glow" aria-hidden="true" />

    <div class="hero-body">
      <!-- 左侧：标签 + 大数字 + chip -->
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

      <!-- 右侧：大进度环 -->
      <div class="hero-ring" aria-hidden="true">
        <svg :width="ringSize" :height="ringSize" :viewBox="`0 0 ${ringSize} ${ringSize}`">
          <!-- 背景轨道 -->
          <circle
            :cx="ringSize/2" :cy="ringSize/2" :r="ringR"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            :stroke-width="ringStroke"
          />
          <!-- 进度弧 -->
          <circle
            :cx="ringSize/2" :cy="ringSize/2" :r="ringR"
            fill="none"
            stroke="url(#countdown-ring-gradient)"
            :stroke-width="ringStroke"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            :transform="`rotate(-90 ${ringSize/2} ${ringSize/2})`"
            class="ring-progress"
          />
          <defs>
            <linearGradient id="countdown-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4499FF" />
              <stop offset="100%" stop-color="#00CCFF" />
            </linearGradient>
          </defs>
        </svg>
        <!-- 环内信息 -->
        <div class="ring-inner">
          <div class="ring-percent">{{ progress }}</div>
          <div class="ring-percent-label">%</div>
          <div class="ring-caption">周期</div>
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
const progress = computed(() => records.progressPercent)
const intervalDays = computed(() => settings.fullChargeIntervalDays)

const batteryLabels = { lfp: '磷酸铁锂', nmc: '三元锂', custom: '自定义' }
const batteryLabel = computed(() => batteryLabels[settings.batteryType] ?? '磷酸铁锂')

const ringSize = 96
const ringR = 38
const ringStroke = 6
const circumference = 2 * Math.PI * ringR
const dashOffset = computed(() =>
  circumference * (1 - Math.min(progress.value, 100) / 100)
)
</script>

<style scoped>
.hero-card {
  background: var(--color-hero);
  border-radius: var(--radius-hero);
  padding: 18px 16px 20px;
  margin: 0 0 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(10, 30, 60, 0.22);
}

.hero-glow {
  position: absolute;
  top: -40px;
  right: -20px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(0,102,255,0.22), transparent 65%);
  pointer-events: none;
}

/* 主体：左右两栏，垂直居中 */
.hero-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: relative;
}

/* 左侧 */
.hero-left {
  flex: 1;
  min-width: 0;
}

.hero-eyebrow {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: var(--font-body);
  margin-bottom: 6px;
}

.hero-number-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 14px;
  overflow: hidden;
}

.hero-number {
  font-size: 72px;
  font-weight: 400;
  color: white;
  line-height: 1;
  letter-spacing: 1px;
  font-family: var(--font-hero);
  animation: slot-in 0.4s ease-in-out;
}

.hero-unit {
  font-size: 24px;
  font-weight: 300;
  color: rgba(255,255,255,0.45);
  font-family: var(--font-body);
  margin-bottom: 4px;
}

.hero-number--empty {
  font-size: 56px;
  letter-spacing: 0;
  color: rgba(255,255,255,0.3);
}

.hero-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hero-chip {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-chip);
  padding: 4px 10px;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  font-weight: 400;
  font-family: var(--font-body);
}

.hero-card--overdue .hero-chip {
  background: rgba(239,68,68,0.18);
  border-color: rgba(239,68,68,0.3);
  color: rgba(255,180,180,0.85);
}

/* 右侧：进度环 */
.hero-ring {
  position: relative;
  flex-shrink: 0;
  width: 96px;
  height: 96px;
}

.ring-progress {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 环内文字 */
.ring-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.ring-percent {
  font-size: 26px;
  font-weight: 400;
  color: white;
  line-height: 1;
  font-family: var(--font-hero);
  letter-spacing: 1px;
}

.ring-percent-label {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  font-family: var(--font-body);
  line-height: 1.2;
}

.ring-caption {
  font-size: 9px;
  color: rgba(255,255,255,0.3);
  font-family: var(--font-body);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 2px;
}

@keyframes slot-in {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
</style>
