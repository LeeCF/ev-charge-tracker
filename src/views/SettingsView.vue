<template>
  <div class="view">
    <header class="page-header">
      <div class="page-title">设置</div>
    </header>

    <div class="content">

      <!-- 车型名称 -->
      <section class="section">
        <div class="section-title">车型名称</div>
        <input
          type="text"
          class="field-input"
          v-model="settings.vehicleName"
          placeholder="如：比亚迪海豹"
        />
      </section>

      <!-- 电池类型可视化选择 -->
      <section class="section">
        <div class="section-title">电池类型</div>
        <div class="battery-grid">
          <button
            v-for="opt in batteryOptions"
            :key="opt.value"
            class="battery-card"
            :class="{ active: settings.batteryType === opt.value }"
            @click="selectBatteryType(opt.value)"
          >
            <!-- SVG 图标 -->
            <div class="battery-icon" v-html="opt.svg" />
            <div class="battery-name">{{ opt.label }}</div>
            <div class="battery-days">{{ opt.days ? `${opt.days}天` : '自设' }}</div>
            <div v-if="settings.batteryType === opt.value" class="battery-check">✓</div>
          </button>
        </div>
      </section>

      <!-- 满充间隔可视化滑块 -->
      <section class="section">
        <div class="section-title">满充间隔</div>
        <div class="slider-card">
          <div class="slider-header">
            <span class="slider-label-text">每隔多少天满充一次</span>
            <div class="slider-value">
              <span class="slider-number">{{ settings.fullChargeIntervalDays }}</span>
              <span class="slider-unit">天</span>
            </div>
          </div>
          <input
            type="range"
            class="slider"
            v-model.number="settings.fullChargeIntervalDays"
            min="7"
            max="90"
            :disabled="settings.batteryType !== 'custom'"
          />
          <div class="slider-range">
            <span>7天</span>
            <span>90天</span>
          </div>
          <div v-if="settings.batteryType !== 'custom'" class="slider-locked">
            由电池类型决定，切换至「自定义」可修改
          </div>
        </div>
      </section>

      <!-- 数据管理 -->
      <section class="section section--danger">
        <div class="section-title">数据管理</div>
        <button class="btn-danger" @click="confirmClear">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="2 4 4 4 14 4"/>
            <path d="M13 4l-.7 9a1.5 1.5 0 0 1-1.5 1.4H5.2a1.5 1.5 0 0 1-1.5-1.4L3 4"/>
            <path d="M6.5 4V3a.75.75 0 0 1 .75-.75h1.5A.75.75 0 0 1 9.5 3v1"/>
          </svg>
          清空所有充电记录
        </button>
        <p class="danger-hint">此操作不可撤销</p>
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
  {
    value: 'lfp',
    label: '磷酸铁锂',
    days: 14,
    // 深海蓝 — 稳定晶格，满电感，3格全亮
    svg: `<svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lfp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1A4FCC"/>
          <stop offset="100%" stop-color="#0A2E8A"/>
        </linearGradient>
        <linearGradient id="lfp-cell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5AAAFF"/>
          <stop offset="100%" stop-color="#2266EE"/>
        </linearGradient>
      </defs>
      <!-- 外壳 -->
      <rect x="1" y="3" width="34" height="22" rx="4" fill="url(#lfp-bg)" stroke="#3366CC" stroke-width="1"/>
      <!-- 正极端子 -->
      <rect x="35" y="10" width="4" height="8" rx="1.5" fill="#3366CC"/>
      <!-- 3格满电 -->
      <rect x="4.5" y="6.5" width="8" height="15" rx="2" fill="url(#lfp-cell)" opacity="0.95"/>
      <rect x="14.5" y="6.5" width="8" height="15" rx="2" fill="url(#lfp-cell)" opacity="0.95"/>
      <rect x="24.5" y="6.5" width="8" height="15" rx="2" fill="url(#lfp-cell)" opacity="0.95"/>
      <!-- 高光 -->
      <rect x="4.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.18"/>
      <rect x="14.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.18"/>
      <rect x="24.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.18"/>
    </svg>`,
  },
  {
    value: 'nmc',
    label: '三元锂',
    days: 30,
    // 琥珀橙紫 — 高密度，能量感，2格亮+1格暗
    svg: `<svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nmc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7C3A8A"/>
          <stop offset="100%" stop-color="#4A1860"/>
        </linearGradient>
        <linearGradient id="nmc-cell-on" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFB347"/>
          <stop offset="100%" stop-color="#E06020"/>
        </linearGradient>
        <linearGradient id="nmc-cell-off" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6A2878"/>
          <stop offset="100%" stop-color="#3A1050"/>
        </linearGradient>
      </defs>
      <!-- 外壳 -->
      <rect x="1" y="3" width="34" height="22" rx="4" fill="url(#nmc-bg)" stroke="#9A4AAA" stroke-width="1"/>
      <!-- 正极端子 -->
      <rect x="35" y="10" width="4" height="8" rx="1.5" fill="#9A4AAA"/>
      <!-- 2格亮 1格暗 -->
      <rect x="4.5" y="6.5" width="8" height="15" rx="2" fill="url(#nmc-cell-on)" opacity="0.95"/>
      <rect x="14.5" y="6.5" width="8" height="15" rx="2" fill="url(#nmc-cell-on)" opacity="0.95"/>
      <rect x="24.5" y="6.5" width="8" height="15" rx="2" fill="url(#nmc-cell-off)" opacity="0.7"/>
      <!-- 高光 -->
      <rect x="4.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.2"/>
      <rect x="14.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.2"/>
      <!-- 闪光点 — 高能量标识 -->
      <path d="M27 10.5L25.5 14.5H27.5L26 18.5" stroke="#FFD080" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
    </svg>`,
  },
  {
    value: 'custom',
    label: '自定义',
    days: null,
    // 青色 — 开放轮廓，虚线格，可变感
    svg: `<svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cus-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0E3A4A"/>
          <stop offset="100%" stop-color="#061E2A"/>
        </linearGradient>
        <linearGradient id="cus-cell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#40D0C0" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#20A090" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <!-- 外壳 虚线 -->
      <rect x="1" y="3" width="34" height="22" rx="4" fill="url(#cus-bg)" stroke="#20A090" stroke-width="1" stroke-dasharray="3 2"/>
      <!-- 正极端子 -->
      <rect x="35" y="10" width="4" height="8" rx="1.5" fill="#20A090" opacity="0.6"/>
      <!-- 3格淡色轮廓 -->
      <rect x="4.5" y="6.5" width="8" height="15" rx="2" fill="url(#cus-cell)" stroke="#30C0B0" stroke-width="0.8" opacity="0.8"/>
      <rect x="14.5" y="6.5" width="8" height="15" rx="2" fill="url(#cus-cell)" stroke="#30C0B0" stroke-width="0.8" opacity="0.8"/>
      <rect x="24.5" y="6.5" width="8" height="15" rx="2" fill="url(#cus-cell)" stroke="#30C0B0" stroke-width="0.8" opacity="0.8"/>
      <!-- 中心加号 — 可配置标识 -->
      <line x1="28.5" y1="11.5" x2="28.5" y2="17.5" stroke="#40D0C0" stroke-width="1.2" stroke-linecap="round" opacity="0.9"/>
      <line x1="25.5" y1="14.5" x2="31.5" y2="14.5" stroke="#40D0C0" stroke-width="1.2" stroke-linecap="round" opacity="0.9"/>
    </svg>`,
  },
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

.page-header { padding: 16px 16px 12px; }

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.5px;
  font-family: var(--font-display);
}

.content {
  padding: 4px 14px calc(80px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.field-input {
  width: 100%;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-card-sm);
  padding: 11px 14px;
  font-size: 15px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0,102,255,0.1);
}

/* 电池卡片网格 */
.battery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.battery-card {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-card-sm);
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.battery-card.active {
  background: var(--color-accent-gradient);
  border-color: transparent;
  box-shadow: 0 3px 12px rgba(0,102,255,0.3);
}

.battery-icon {
  width: 40px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.battery-icon svg {
  width: 40px;
  height: 28px;
}

.battery-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text);
}
.battery-card.active .battery-name { color: white; }

.battery-days {
  font-size: 10px;
  color: var(--color-text-muted);
}
.battery-card.active .battery-days { color: rgba(255,255,255,0.7); }

.battery-check {
  position: absolute;
  top: 6px;
  right: 7px;
  font-size: 10px;
  color: white;
  font-weight: 700;
}

/* 滑块卡片 */
.slider-card {
  background: var(--color-surface);
  border-radius: var(--radius-card-sm);
  padding: 14px;
  box-shadow: var(--shadow-card-sm);
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.slider-label-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.slider-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.slider-number {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-accent);
  font-family: var(--font-body);
  letter-spacing: -0.3px;
}

.slider-unit {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-accent-light);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 2px 8px rgba(0,102,255,0.35);
  border: 3px solid white;
  cursor: pointer;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-range {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  color: var(--color-text-muted);
}

.slider-locked {
  margin-top: 8px;
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
}

/* 危险区 */
.btn-danger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 13px 14px;
  border: 1.5px solid var(--color-danger);
  border-radius: var(--radius-card-sm);
  background: var(--color-surface);
  color: var(--color-danger);
  font-size: 14px;
  font-weight: 600;
  min-height: 48px;
  transition: background 0.15s;
}

.btn-danger:active { background: var(--color-danger-bg); }
.btn-danger svg { width: 16px; height: 16px; flex-shrink: 0; }

.danger-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 6px;
  padding-left: 2px;
}
</style>
