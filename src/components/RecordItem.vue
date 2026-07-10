<template>
  <!-- Wrapper: swipe track -->
  <div class="swipe-wrapper" :class="{ 'swipe-wrapper--deleting': deleting }">

    <!-- Delete background revealed on swipe -->
    <div class="delete-bg" :style="{ opacity: Math.min(1, rawX / THRESHOLD) }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      <button class="pending-undo-btn" @click.stop="$emit('undo-delete', record.id)">撤销</button>
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
          <span class="record-date">{{ record.date }}</span>
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
            <svg viewBox="0 0 12 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M6 1C3.24 1 1 3.24 1 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"/>
              <circle cx="6" cy="6" r="1.5"/>
            </svg>
            {{ record.location }}
          </span>
          <svg
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
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <rect x="2" y="2" width="12" height="12" rx="2"/>
              <line x1="5" y1="6" x2="11" y2="6"/>
              <line x1="5" y1="9" x2="9" y2="9"/>
            </svg>
            {{ record.note }}
          </div>
          <button class="btn-edit" @click.stop="$emit('edit', record)">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
import { ref, computed } from 'vue'

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

const cardStyle = computed(() => {
  if (deleting.value) {
    return { transform: 'translateX(-110%)', transition: 'transform 0.28s cubic-bezier(0.4,0,0.6,1)' }
  }
  if (dragging.value) {
    return { transform: `translateX(${-dragX.value}px)`, transition: 'none' }
  }
  if (rawX.value > 0) {
    // snap back with spring
    return { transform: 'translateX(0)', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' }
  }
  return {}
})

// Touch
function onTouchStart(e) {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isSwiping = false
  dragging.value = false
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
}

function onTouchEnd() {
  dragging.value = false
  if (rawX.value >= THRESHOLD) {
    triggerDelete()
  } else {
    rawX.value = 0
  }
}

// Mouse (desktop drag support)
function onMouseDown(e) {
  startX = e.clientX
  isSwiping = false
  const onMove = (e) => {
    const dx = startX - e.clientX
    if (!dragging.value) {
      if (Math.abs(dx) < 4) return
      dragging.value = true
      isSwiping = true
    }
    rawX.value = Math.max(0, dx)
  }
  const onUp = () => {
    dragging.value = false
    if (rawX.value >= THRESHOLD) {
      triggerDelete()
    } else {
      rawX.value = 0
    }
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

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
  color: white;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 3px;
  font-family: var(--font-body);
  letter-spacing: 0;
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
  background: linear-gradient(145deg, #0A1E3D, #0D2D5A);
  border-radius: var(--radius-card-sm);
  padding: 12px 14px 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
}

.pending-delete-title {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin-bottom: 2px;
}

.pending-delete-sub {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
}

.pending-undo-btn {
  font-size: 13px;
  font-weight: 700;
  color: #60B4FF;
  background: none;
  border: none;
  padding: 4px 0 4px 16px;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
}
</style>
