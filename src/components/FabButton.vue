<template>
  <button class="fab" :class="{ collapsed: isCollapsed }" @click="$emit('click')">
    <svg class="fab-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    <span class="fab-label">记录充电</span>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineEmits(['click'])

const isCollapsed = ref(false)
let scrollTarget = null

function onScroll() {
  isCollapsed.value = (scrollTarget?.scrollTop ?? 0) > 60
}

onMounted(() => {
  scrollTarget = document.querySelector('.app-content') ?? document.documentElement
  scrollTarget.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  scrollTarget?.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.fab {
  position: fixed;
  right: 16px;
  bottom: calc(49px + 16px + env(safe-area-inset-bottom, 0px));
  height: 52px;
  background: var(--color-accent-gradient);
  border: none;
  border-radius: var(--radius-fab-extended);
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  box-shadow: var(--shadow-fab);
  cursor: pointer;
  z-index: 50;
  transition:
    border-radius 0.3s cubic-bezier(0.4,0,0.2,1),
    padding 0.3s cubic-bezier(0.4,0,0.2,1);
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.fab:active {
  transform: scale(0.96);
  transition: transform 0.08s ease,
              border-radius 0.3s cubic-bezier(0.4,0,0.2,1),
              padding 0.3s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 2px 10px rgba(0, 82, 212, 0.3);
}

.fab-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.fab-label {
  overflow: hidden;
  max-width: 80px;
  transition: max-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s;
}

/* 收缩态：变为圆角方形 */
.fab.collapsed {
  border-radius: var(--radius-fab);
  padding: 0;
  width: 52px;
  justify-content: center;
}

.fab.collapsed .fab-label {
  max-width: 0;
  opacity: 0;
}
</style>
