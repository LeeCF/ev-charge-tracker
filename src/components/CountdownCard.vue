<template>
  <div class="hero-card" :class="{ 'hero-card--overdue': hasData && displayDays < 0 }">
    <!-- 右上角光晕装饰 -->
    <div class="hero-glow" aria-hidden="true" />

    <div class="hero-content">
      <!-- 左侧：标签 + 大数字 + 底部信息 -->
      <div class="hero-left">
        <div class="hero-eyebrow">距满充还有</div>
        <div class="hero-number-wrap">
          <span v-if="hasData" class="hero-number" :key="displayDays">{{ Math.abs(displayDays) }}</span>
          <span v-else class="hero-number hero-number--empty">--</span>
        </div>
        <div class="hero-unit-row">
          <span class="hero-unit">天</span>
          <span class="hero-unit-sub">{{ hasData && displayDays < 0 ? '已逾期' : '后满充' }}</span>
        </div>
        <div class="hero-meta">
          <span class="hero-chip">{{ batteryLabel }}</span>
          <span class="hero-chip">{{ intervalDays }}天周期</span>
        </div>
      </div>

      <!-- 右侧：SVG 进度环 -->
      <div class="hero-ring" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="26"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="5"
          />
          <circle
            cx="32" cy="32" r="26"
            fill="none"
            stroke="url(#countdown-ring-gradient)"
            stroke-width="5"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 32 32)"
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

const circumference = 2 * Math.PI * 26  // ≈ 163.4
const dashOffset = computed(() =>
  circumference * (1 - Math.min(progress.value, 100) / 100)
)
</script>

<style scoped>
.hero-card {
  background: var(--color-hero);
  border-radius: var(--radius-hero);
  padding: 18px 16px;
  margin: 0 0 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(10, 30, 60, 0.22);
}

.hero-glow {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, rgba(0,102,255,0.28), transparent 65%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
}

.hero-left { flex: 1; }

.hero-eyebrow {
  font-size: 10px;
  color: rgba(255,255,255,0.38);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-family: var(--font-body);
}

.hero-number-wrap {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2px;
  overflow: hidden;
}

.hero-number {
  font-size: 60px;
  font-weight: 800;
  color: white;
  line-height: 1;
  letter-spacing: -3px;
  font-family: var(--font-display);
  animation: slot-in 0.4s ease-in-out;
}

.hero-unit-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.hero-unit {
  font-size: 15px;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
  font-family: var(--font-body);
  letter-spacing: 0.5px;
}

.hero-unit-sub {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  font-weight: 400;
  font-family: var(--font-body);
  letter-spacing: 0.5px;
}

.hero-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hero-chip {
  background: rgba(0,102,255,0.18);
  border: 1px solid rgba(0,102,255,0.28);
  border-radius: var(--radius-chip);
  padding: 3px 10px;
  font-size: 10px;
  color: rgba(180,220,255,0.9);
  font-weight: 500;
}

.hero-number--empty {
  font-size: 48px;
  letter-spacing: 0;
  color: rgba(255,255,255,0.35);
}

.hero-card--overdue .hero-chip {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.35);
  color: rgba(255,180,180,0.9);
}

.hero-ring {
  position: relative;
  flex-shrink: 0;
  margin-bottom: 4px;
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
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
}

@keyframes slot-in {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
</style>
