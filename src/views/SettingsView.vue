<template>
  <div class="view">
    <header class="page-header">
      <div class="page-title">设置</div>
    </header>

    <div class="content">

      <!-- 车型名称 -->
      <section class="section">
        <div class="section-title">
          <svg aria-hidden="true" class="section-icon" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 6h12M2 6L3.5 3h7L12 6"/>
            <rect x="1" y="6" width="12" height="2.5" rx="1.2"/>
            <circle cx="4" cy="8.5" r="1"/>
            <circle cx="10" cy="8.5" r="1"/>
          </svg>
          车型名称
        </div>
        <input
          type="text"
          class="field-input"
          v-model="settings.vehicleName"
          placeholder="如：比亚迪海豹"
        />
      </section>

      <!-- 电池类型可视化选择 -->
      <section class="section">
        <div class="section-title">
          <svg aria-hidden="true" class="section-icon" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="2" width="11" height="6" rx="1.2"/>
            <path d="M12 4.5h1.2a.3.3 0 0 1 0 1H12"/>
            <line x1="4" y1="2" x2="4" y2="8"/>
            <line x1="7" y1="2" x2="7" y2="8"/>
          </svg>
          电池类型
        </div>
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
            <div v-if="settings.batteryType === opt.value" class="battery-check">
              <svg aria-hidden="true" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2 5.5 4.2 7.5 8 3"/>
              </svg>
            </div>
          </button>
        </div>
      </section>

      <!-- 满充间隔可视化滑块 -->
      <section class="section">
        <div class="section-title">
          <svg aria-hidden="true" class="section-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 1a6 6 0 1 0 .01 0"/>
            <polyline points="7 4.5 7 7.5 9 9"/>
          </svg>
          满充间隔
        </div>
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
            <svg aria-hidden="true" class="lock-icon" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="8" height="7" rx="1.5"/>
              <path d="M4 6V4.5a2 2 0 0 1 4 0V6"/>
            </svg>
            由电池类型决定，切换至「自定义」可修改
          </div>
        </div>
      </section>

      <!-- 数据管理 -->
      <section class="section section--danger">
        <div class="section-title">
          <svg aria-hidden="true" class="section-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="7" cy="4" rx="5" ry="2"/>
            <path d="M2 4v6c0 1.1 2.24 2 5 2s5-.9 5-2V4"/>
            <path d="M2 7c0 1.1 2.24 2 5 2s5-.9 5-2"/>
          </svg>
          数据管理
        </div>

        <!-- 第一步：显示警告按钮 -->
        <div v-if="clearStep === 0">
          <button class="btn-danger" @click="clearStep = 1">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="2 4 4 4 14 4"/>
              <path d="M13 4l-.7 9a1.5 1.5 0 0 1-1.5 1.4H5.2a1.5 1.5 0 0 1-1.5-1.4L3 4"/>
              <path d="M6.5 4V3a.75.75 0 0 1 .75-.75h1.5A.75.75 0 0 1 9.5 3v1"/>
            </svg>
            清空所有充电记录
          </button>
          <p class="danger-hint">此操作不可撤销</p>
        </div>

        <!-- 第二步：滑动确认 -->
        <div v-else class="clear-confirm">
          <p class="clear-confirm-text">
            <svg aria-hidden="true" class="warn-icon" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 1L1 13h14L8 1z"/>
              <line x1="8" y1="6" x2="8" y2="9.5"/>
              <circle cx="8" cy="11.5" r="0.7" fill="currentColor" stroke="none"/>
            </svg>
            确认清空所有记录？
          </p>
          <div class="slider-confirm-wrap">
            <div
              class="slider-confirm-track"
              ref="sliderTrack"
            >
              <div
                class="slider-confirm-thumb"
                :style="{ transform: `translateX(${slideX}px)` }"
                @touchstart.prevent="onSlideStart"
                @touchmove.prevent="onSlideMove"
                @touchend="onSlideEnd"
                @mousedown="onSlideMouseDown"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <span class="slider-confirm-label" :style="{ opacity: 1 - slideX / slideMax }">向右滑动确认删除</span>
            </div>
          </div>
          <button class="btn-cancel" @click="clearStep = 0">取消</button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '../stores/settings.js'
import { useRecordsStore } from '../stores/records.js'

const settings = useSettingsStore()
const recordsStore = useRecordsStore()

// 清空二次确认滑动逻辑
const clearStep = ref(0)
const sliderTrack = ref(null)
const slideX = ref(0)

const slideMax = computed(() => {
  const trackW = sliderTrack.value?.offsetWidth ?? 280
  return trackW - 52
})

let slideStartX = 0

function onSlideStart(e) {
  slideStartX = e.touches[0].clientX
}

function onSlideMove(e) {
  const dx = e.touches[0].clientX - slideStartX
  const max = slideMax.value
  slideX.value = Math.max(0, Math.min(dx, max))
  if (slideX.value >= max - 4) executeClear()
}

function onSlideEnd() {
  const max = slideMax.value
  if (slideX.value < max - 4) slideX.value = 0
}

function onSlideMouseDown(e) {
  slideStartX = e.clientX
  const onMove = (e) => {
    const dx = e.clientX - slideStartX
    const max = slideMax.value
    slideX.value = Math.max(0, Math.min(dx, max))
    if (slideX.value >= max - 4) executeClear()
  }
  const onUp = () => {
    const max = slideMax.value
    if (slideX.value < max - 4) slideX.value = 0
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function executeClear() {
  recordsStore.clearAll()
  clearStep.value = 0
  slideX.value = 0
}

const batteryOptions = [
  {
    value: 'lfp',
    label: '磷酸铁锂',
    days: 14,
    // 深海蓝 — 稳定晶格，满电感，3格全亮
    svg: `<svg aria-hidden="true" width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    // 琥珀橙紫 — 高密度，3格全亮，闪光符号标识高能量
    svg: `<svg aria-hidden="true" width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nmc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7C3A8A"/>
          <stop offset="100%" stop-color="#4A1860"/>
        </linearGradient>
        <linearGradient id="nmc-cell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFB347"/>
          <stop offset="100%" stop-color="#E06020"/>
        </linearGradient>
      </defs>
      <!-- 外壳 -->
      <rect x="1" y="3" width="34" height="22" rx="4" fill="url(#nmc-bg)" stroke="#9A4AAA" stroke-width="1"/>
      <!-- 正极端子 -->
      <rect x="35" y="10" width="4" height="8" rx="1.5" fill="#9A4AAA"/>
      <!-- 3格全亮 -->
      <rect x="4.5" y="6.5" width="8" height="15" rx="2" fill="url(#nmc-cell)" opacity="0.95"/>
      <rect x="14.5" y="6.5" width="8" height="15" rx="2" fill="url(#nmc-cell)" opacity="0.95"/>
      <rect x="24.5" y="6.5" width="8" height="15" rx="2" fill="url(#nmc-cell)" opacity="0.95"/>
      <!-- 高光 -->
      <rect x="4.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.2"/>
      <rect x="14.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.2"/>
      <rect x="24.5" y="6.5" width="8" height="4" rx="2" fill="white" opacity="0.2"/>
    </svg>`,
  },
  {
    value: 'custom',
    label: '自定义',
    days: null,
    // 青色 — 开放轮廓，虚线格，可变感
    svg: `<svg aria-hidden="true" width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  if (opt?.days) settings.fullChargeIntervalDays = opt.days
}
</script>

<style scoped>
.view { min-height: 100%; }

.page-header { padding: 16px 16px 12px; }

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.8px;
  font-family: var(--font-display);
  line-height: 1.1;
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
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  opacity: 0.7;
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
  box-shadow: 0 0 0 3px var(--color-accent-focus);
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
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.08s ease;
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
  box-shadow: 0 3px 12px var(--color-accent-glow);
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
.battery-card.active .battery-name { color: var(--color-on-dark); }

.battery-days {
  font-size: 10px;
  color: var(--color-text-muted);
}
.battery-card.active .battery-days { color: var(--color-on-dark-secondary); }

.battery-check {
  position: absolute;
  top: 5px;
  right: 6px;
  width: 14px;
  height: 14px;
  color: var(--color-on-dark);
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.battery-check svg {
  width: 9px;
  height: 9px;
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
  box-shadow: 0 2px 8px var(--color-accent-glow-sm);
  border: 3px solid var(--color-surface);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.lock-icon {
  width: 11px;
  height: 12px;
  flex-shrink: 0;
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

/* 滑动确认 */
.clear-confirm {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clear-confirm-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 6px;
}

.warn-icon {
  width: 15px;
  height: 13px;
  flex-shrink: 0;
}

.slider-confirm-wrap {
  width: 100%;
}

.slider-confirm-track {
  position: relative;
  background: var(--color-danger-bg);
  border: 1.5px solid var(--color-danger);
  border-radius: 12px;
  height: 48px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.slider-confirm-thumb {
  position: absolute;
  left: 2px;
  width: 44px;
  height: 40px;
  background: var(--color-danger);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-dark);
  cursor: grab;
  z-index: 1;
  touch-action: none;
  transition: none;
}

.slider-confirm-label {
  position: absolute;
  left: 0; right: 0;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-danger);
  pointer-events: none;
  user-select: none;
}

.btn-cancel {
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-sm);
  padding: 8px 0;
  width: 100%;
  text-align: center;
  cursor: pointer;
}
</style>
