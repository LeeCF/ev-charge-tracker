<template>
  <div class="hero-card" :class="{ 'hero-card--overdue': hasData && displayDays < 0 }">
    <div class="hero-glow" aria-hidden="true" />

    <!-- 顶部：eyebrow + 进度环 同行 -->
    <div class="hero-top">
      <div class="hero-eyebrow">{{ hasData && displayDays < 0 ? '满充已逾期' : '距满充还有' }}</div>
      <div class="hero-ring" aria-hidden="true">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>
          <circle
            cx="26" cy="26" r="21"
            fill="none"
            stroke="url(#countdown-ring-gradient)"
            stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 26 26)"
            class="ring-progress"
          />
          <defs>
            <linearGradient id="countdown-ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0066FF" />
              <stop offset="100%" stop-color="#00AAFF" />
            </linearGradient>
          </defs>
        </svg>
        <div class="ring-label">{{ progress }}%</div>
      </div>
    </div>

    <!-- 中部：大数字 + 单位内联 -->
    <div class="hero-number-wrap">
      <span v-if="hasData" class="hero-number" :key="displayDays">{{ Math.abs(displayDays) }}</span>
      <span v-else class="hero-number hero-number--empty">--</span>
      <span class="hero-unit">天</span>
    </div>

    <!-- 底部：chip 标签 -->
    <div class="hero-meta">
      <span class="hero-chip">{{ batteryLabel }}</span>
      <span class="hero-chip">{{ intervalDays }}天周期</span>
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

const circumference = 2 * Math.PI * 21  // r=21
const dashOffset = computed(() =>
  circumference * (1 - Math.min(progress.value, 100) / 100)
)
</script>

<style scoped>
.hero-card {
  background: var(--color-hero);
  border-radius: var(--radius-hero);
  padding: 16px 18px 18px;
  margin: 0 0 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(10, 30, 60, 0.22);
}

.hero-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(0,102,255,0.3), transparent 65%);
  pointer-events: none;
}

/* 顶部行：eyebrow 左，进度环 右 */
.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  position: relative;
}

.hero-eyebrow {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: var(--font-body);
  margin-top: 4px;
}

/* 进度环 */
.hero-ring {
  position: relative;
  flex-shrink: 0;
}

.ring-progress {
  transition: stroke-dashoffset 0.6s ease;
}

.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  font-family: var(--font-body);
}

/* 中部：大数字 + 单位 baseline 对齐 */
.hero-number-wrap {
  display: flex;
  align-items: baseline;
  gap: 0;
  margin-bottom: 14px;
  overflow: hidden;
  position: relative;
}

.hero-number {
  font-size: 76px;
  font-weight: 400;
  color: white;
  line-height: 1;
  letter-spacing: 1px;
  font-family: var(--font-hero);
  animation: slot-in 0.4s ease-in-out;
}

.hero-unit {
  font-size: 26px;
  font-weight: 300;
  color: rgba(255,255,255,0.5);
  font-family: var(--font-body);
  letter-spacing: 0;
  margin-left: 6px;
  margin-bottom: 6px;
}

.hero-number--empty {
  font-size: 60px;
  letter-spacing: 0;
  color: rgba(255,255,255,0.35);
}

/* 底部 chip */
.hero-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hero-chip {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-chip);
  padding: 4px 10px;
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  font-weight: 400;
  font-family: var(--font-body);
}

.hero-card--overdue .hero-chip {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.3);
  color: rgba(255,180,180,0.85);
}

@keyframes slot-in {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
</style>
