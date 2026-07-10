<template>
  <div v-if="bars.length >= 2" class="cost-chart-card">
    <div class="chart-header">
      <span class="chart-title">近{{ bars.length }}月花费</span>
      <span class="chart-current">¥{{ currentMonthCost?.toFixed(0) ?? '--' }} 本月</span>
    </div>
    <div class="chart-wrap">
      <svg :width="svgWidth" :height="svgHeight" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
        <defs>
          <linearGradient id="bar-current" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0044DD"/>
            <stop offset="100%" stop-color="#0088FF"/>
          </linearGradient>
          <linearGradient id="bar-past" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0066FF" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#60B0FF" stop-opacity="0.5"/>
          </linearGradient>
        </defs>

        <g v-for="(bar, i) in bars" :key="bar.label">
          <rect
            :x="bar.x"
            :y="bar.y"
            :width="barWidth - 4"
            :height="bar.height"
            :rx="3"
            :fill="bar.isCurrent ? 'url(#bar-current)' : 'url(#bar-past)'"
            class="bar-rect"
            :style="{ animationDelay: `${i * 50}ms` }"
          />
          <text
            :x="bar.x + (barWidth - 4) / 2"
            :y="bar.y - 4"
            text-anchor="middle"
            :font-size="9"
            :fill="bar.isCurrent ? '#0066FF' : '#B0C8E0'"
            font-family="DM Sans, PingFang SC, sans-serif"
            font-weight="600"
          >¥{{ bar.total.toFixed(0) }}</text>
          <text
            :x="bar.x + (barWidth - 4) / 2"
            :y="svgHeight - 2"
            text-anchor="middle"
            :font-size="9"
            :fill="bar.isCurrent ? '#0066FF' : '#B0C8E0'"
            font-family="DM Sans, PingFang SC, sans-serif"
            :font-weight="bar.isCurrent ? '700' : '400'"
          >{{ bar.monthLabel }}</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  monthlyCosts: { type: Array, default: () => [] },
  currentMonth: { type: String, default: '' },
})

const svgWidth = 280
const svgHeight = 90
const barAreaHeight = 65
const maxBars = 6

const bars = computed(() => {
  const recent = [...props.monthlyCosts].slice(0, maxBars).reverse()
  if (recent.length < 2) return []

  const maxTotal = Math.max(...recent.map(m => m.total), 1)
  const bw = svgWidth / recent.length

  return recent.map((m, i) => {
    const height = Math.max(4, (m.total / maxTotal) * barAreaHeight)
    const [year, mon] = m.label.split('-')
    const thisYear = new Date().getFullYear().toString()
    return {
      label: m.label,
      total: m.total,
      monthLabel: year === thisYear ? `${parseInt(mon)}月` : `${year.slice(2)}/${parseInt(mon)}`,
      isCurrent: m.label === props.currentMonth,
      x: i * bw + 2,
      y: barAreaHeight - height + 10,
      height,
    }
  })
})

const currentMonthCost = computed(() => {
  const item = props.monthlyCosts.find(m => m.label === props.currentMonth)
  return item?.total ?? null
})

const barWidth = computed(() => svgWidth / Math.max(bars.value.length, 1))
</script>

<style scoped>
.cost-chart-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: 12px 14px;
  box-shadow: var(--shadow-card-sm);
  margin-bottom: 10px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-title {
  font-size: 10px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.chart-current {
  font-size: 11px;
  color: var(--color-accent);
  font-weight: 600;
}

.chart-wrap {
  overflow: hidden;
  width: 100%;
}

.chart-wrap svg {
  width: 100%;
  height: auto;
}

.bar-rect {
  animation: bar-rise 0.4s ease-out both;
  transform-origin: bottom;
}

@keyframes bar-rise {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
</style>
