<template>
  <!-- Wrapper: swipe track -->
  <div class="swipe-wrapper" :class="{ 'swipe-wrapper--deleting': deleting }">

    <!-- Delete background revealed on swipe -->
    <div class="delete-bg" :style="{ opacity: Math.min(1, rawX / THRESHOLD) }">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
      <span>删除</span>
    </div>

    <!-- Soft-delete state: shown when pendingDelete is true -->
    <div v-if="record.pendingDelete" class="pending-delete-card">
      <div class="pending-delete-info">
        <div class="pending-delete-title">已删除</div>
        <div class="pending-delete-sub">{{ record.date }} · {{ typeLabel }}</div>
      </div>
      <button class="pending-undo-btn" @click.stop="$emit('undo-delete', record.id)">
        <svg aria-hidden="true" class="undo-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3.5 6.5H9a4 4 0 0 1 0 8H5"/>
          <polyline points="3.5 3 3.5 6.5 7 6.5"/>
        </svg>
        撤销
      </button>
    </div>

    <!-- Normal card: shown when NOT pendingDelete -->
    <div
      v-else
      class="record-item"
      :class="{ 'record-item--full': record.isFull, 'record-item--new': isNew }"
      :style="cardStyle"
      @click="onCardClick"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <div class="accent-bar" />

      <div class="record-main">
        <div class="record-left">
          <span class="record-date">
            <svg aria-hidden="true" class="date-icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
              <rect x="1" y="2" width="10" height="9" rx="1.2"/>
              <line x1="1" y1="5" x2="11" y2="5"/>
              <line x1="4" y1="0.8" x2="4" y2="3.2"/>
              <line x1="8" y1="0.8" x2="8" y2="3.2"/>
            </svg>
            {{ record.date }}
          </span>
          <div class="tags">
            <span class="tag tag--type">{{ typeLabel }}</span>
            <span class="tag" :class="record.isFull ? 'tag--full' : 'tag--partial'">
              {{ record.isFull ? '满充 100%' : `非满充 ${record.endSoc}%` }}
            </span>
          </div>
        </div>
        <div class="record-right">
          <span v-if="record.cost != null" class="record-cost">¥{{ record.cost.toFixed(2) }}</span>
          <span v-if="record.location" class="record-location">
            <svg aria-hidden="true" viewBox="0 0 12 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M6 1C3.24 1 1 3.24 1 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"/>
              <circle cx="6" cy="6" r="1.5"/>
            </svg>
            {{ record.location }}
          </span>
          <svg aria-hidden="true"
            class="expand-chevron"
            :class="{ 'expand-chevron--open': expanded }"
            viewBox="0 0 12 8" fill="none"
            stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M1 1.5l5 5 5-5"/>
          </svg>
        </div>
      </div>

      <transition name="expand">
        <div v-if="expanded" class="record-expand">
          <div v-if="record.note" class="record-note">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <rect x="2" y="2" width="12" height="12" rx="2"/>
              <line x1="5" y1="6" x2="11" y2="6"/>
              <line x1="5" y1="9" x2="9" y2="9"/>
            </svg>
            {{ record.note }}
          </div>
          <button class="btn-edit" @click.stop="$emit('edit', record)">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 2l3 3-8 8H3v-3L11 2z"/>
            </svg>
            编辑记录
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({ record: Object, isNew: Boolean })
const emit = defineEmits(['edit', 'pending-delete', 'undo-delete'])

// ── Expand / collapse ─────────────────────────────────────────────
const expanded = ref(false)
const typeLabels = { slow: '慢充', fast: '快充', superfast: '超快充' }
const typeLabel = computed(() => typeLabels[props.record.type] ?? '')

// ── Swipe-to-delete ───────────────────────────────────────────────
const THRESHOLD = 130  // raw finger px needed to trigger delete

// Raw finger travel (positive = leftward)
const rawX = ref(0)
const dragging = ref(false)
const deleting = ref(false)

let startX = 0
let startY = 0
let isSwiping = false   // confirmed horizontal swipe, suppress click

// Velocity tracking — keep last few frames for release velocity
const velHistory = []
const VEL_WINDOW = 80 // ms window for velocity calculation

function recordVelocity(x) {
  const now = performance.now()
  velHistory.push({ x, t: now })
  // Keep only recent frames within window
  while (velHistory.length > 1 && now - velHistory[0].t > VEL_WINDOW) {
    velHistory.shift()
  }
}

function getReleaseVelocity() {
  if (velHistory.length < 2) return 0
  const newest = velHistory[velHistory.length - 1]
  const oldest = velHistory[0]
  const dt = newest.t - oldest.t
  if (dt < 1) return 0
  // px/ms, positive = leftward
  return (newest.x - oldest.x) / dt
}

// Apple momentum projection: project resting point from velocity
function project(velocityPxMs, decelerationRate = 0.998) {
  // convert to px/s for the formula
  const v = velocityPxMs * 1000
  return (v / 1000) * decelerationRate / (1 - decelerationRate)
}

// Progressive damping: card moves less and less as finger travels further.
// Formula: visual = raw * k / (1 + raw * k / maxVisual)
// k=0.55, maxVisual=72 → at raw=130 finger gives ~48px card travel, feels heavy.
function dampedX(raw) {
  const k = 0.55
  const maxVisual = 72
  return (raw * k) / (1 + (raw * k) / maxVisual)
}

// Expose damped value for delete-bg opacity
const dragX = computed(() => dampedX(rawX.value))

// snapBackDuration tracks release velocity for snap-back spring feel
const snapBackDuration = ref(0.35)

const cardStyle = computed(() => {
  if (deleting.value) {
    return { transform: 'translateX(-110%)', transition: 'transform 0.28s cubic-bezier(0.4,0,0.6,1)' }
  }
  if (dragging.value) {
    return { transform: `translateX(${-dragX.value}px)`, transition: 'none' }
  }
  if (rawX.value > 0) {
    // snap back — faster if released with low velocity, slower if high
    return { transform: 'translateX(0)', transition: `transform ${snapBackDuration.value}s cubic-bezier(0.34,1.56,0.64,1)` }
  }
  return {}
})

// Touch
function onTouchStart(e) {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isSwiping = false
  dragging.value = false
  velHistory.length = 0
}

function onTouchMove(e) {
  const dx = startX - e.touches[0].clientX   // positive = leftward
  const dy = Math.abs(e.touches[0].clientY - startY)

  if (!dragging.value && Math.abs(dx) < 6 && dy < 6) return
  if (!dragging.value) {
    if (dy > Math.abs(dx)) return
    dragging.value = true
    isSwiping = true
  }

  rawX.value = Math.max(0, dx)
  recordVelocity(rawX.value)
}

function onTouchEnd() {
  dragging.value = false
  const vel = getReleaseVelocity() // px/ms leftward
  const projectedEnd = rawX.value + project(vel)

  if (rawX.value >= THRESHOLD || projectedEnd >= THRESHOLD) {
    triggerDelete()
  } else {
    // Tune snap-back speed based on velocity — fast flick = quick snap back
    snapBackDuration.value = vel > 0.3 ? 0.22 : 0.35
    rawX.value = 0
  }
  velHistory.length = 0
}

// Mouse (desktop drag support)
let mouseMoveFn = null
let mouseUpFn = null

function onMouseDown(e) {
  startX = e.clientX
  isSwiping = false
  velHistory.length = 0
  mouseMoveFn = (e) => {
    const dx = startX - e.clientX
    if (!dragging.value) {
      if (Math.abs(dx) < 4) return
      dragging.value = true
      isSwiping = true
    }
    rawX.value = Math.max(0, dx)
    recordVelocity(rawX.value)
  }
  mouseUpFn = () => {
    dragging.value = false
    const vel = getReleaseVelocity()
    const projectedEnd = rawX.value + project(vel)
    if (rawX.value >= THRESHOLD || projectedEnd >= THRESHOLD) {
      triggerDelete()
    } else {
      snapBackDuration.value = vel > 0.3 ? 0.22 : 0.35
      rawX.value = 0
    }
    velHistory.length = 0
    window.removeEventListener('mousemove', mouseMoveFn)
    window.removeEventListener('mouseup', mouseUpFn)
    mouseMoveFn = null
    mouseUpFn = null
  }
  window.addEventListener('mousemove', mouseMoveFn)
  window.addEventListener('mouseup', mouseUpFn)
}

onUnmounted(() => {
  if (mouseMoveFn) window.removeEventListener('mousemove', mouseMoveFn)
  if (mouseUpFn) window.removeEventListener('mouseup', mouseUpFn)
})

function onCardClick() {
  if (isSwiping) {
    isSwiping = false
    return
  }
  expanded.value = !expanded.value
}

function triggerDelete() {
  deleting.value = true
  setTimeout(() => {
    emit('pending-delete', props.record.id)
    // Reset visual state so the wrapper re-expands to show the pending-delete card
    deleting.value = false
    rawX.value = 0
  }, 280)
}
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────────────────────── */
.swipe-wrapper {
  position: relative;
  margin-bottom: 8px;
  border-radius: var(--radius-card);
  overflow: hidden;
}

/* Collapse height when deleting (after card slides out) */
.swipe-wrapper--deleting {
  animation: collapse 0.22s 0.26s ease forwards;
}

@keyframes collapse {
  from { max-height: 200px; opacity: 1; margin-bottom: 8px; }
  to   { max-height: 0;     opacity: 0; margin-bottom: 0; }
}

/* ── Delete background ───────────────────────────────────────────── */
.delete-bg {
  position: absolute;
  inset: 0;
  background: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 24px;
  gap: 6px;
  color: var(--color-on-dark);
  border-radius: var(--radius-card);
}

.delete-bg svg { width: 20px; height: 20px; }
.delete-bg span { font-size: 13px; font-weight: 600; letter-spacing: 0.3px; }

/* ── Card ────────────────────────────────────────────────────────── */
.record-item {
  background: var(--color-surface);
  border-radius: var(--radius-card-sm);
  padding: 12px 14px 12px 16px;
  box-shadow: var(--shadow-card-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.record-item:active {
  box-shadow: var(--shadow-card-press);
  transform: scale(0.985);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

/* Accent bar */
.accent-bar {
  position: absolute;
  left: 0; top: 12%; bottom: 12%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--color-border);
}
.record-item--full .accent-bar { background: var(--color-accent); }

/* 保存后飞入动画 */
.record-item--new {
  animation: record-fly-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes record-fly-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Layout */
.record-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.record-left { flex: 1; }

.record-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 3px;
  font-family: var(--font-body);
  letter-spacing: 0;
}

.date-icon {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.tags { display: flex; gap: 6px; flex-wrap: wrap; }

.tag {
  font-size: 10px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: var(--radius-chip);
}
.tag--type {
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.tag--full {
  background: var(--color-accent-light);
  color: var(--color-accent-text);
}
.tag--partial {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  min-width: 0;
}

.record-cost {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.record-location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.record-location svg { width: 9px; height: 12px; flex-shrink: 0; }

.expand-chevron {
  width: 12px; height: 8px;
  color: var(--color-text-muted);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.expand-chevron--open { transform: rotate(180deg); }

.record-expand {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.record-note svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; opacity: 0.4; }

/* Note expand animation */
.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1.5px solid var(--color-accent-light);
  border-radius: var(--radius-chip);
  background: var(--color-accent-light);
  color: var(--color-accent-text);
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
  transition: background 0.15s;
}
.btn-edit svg { width: 12px; height: 12px; flex-shrink: 0; }
.btn-edit:active { background: var(--color-border); }

.expand-enter-active, .expand-leave-active {
  transition: opacity 0.2s, transform 0.2s;
  transform-origin: top;
}
.expand-enter-from, .expand-leave-to { opacity: 0; transform: scaleY(0.85); }

.pending-delete-card {
  background: var(--color-hero);
  border-radius: var(--radius-card-sm);
  padding: 12px 14px 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
}

.pending-delete-title {
  font-size: 12px;
  color: var(--color-on-dark-muted);
  margin-bottom: 2px;
}

.pending-delete-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-dark-secondary);
}

.pending-undo-btn {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent-end);
  background: none;
  border: none;
  padding: 4px 0 4px 16px;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.undo-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
