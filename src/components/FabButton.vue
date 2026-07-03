<template>
  <button class="fab" @click="$emit('click')" aria-label="添加充电记录">
    <svg class="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 88px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--gradient-accent);
  color: white;
  box-shadow: var(--shadow-fab);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s;
}

.fab:active {
  transform: scale(0.9);
  box-shadow: 0 2px 10px rgba(0, 82, 212, 0.3);
}

.fab-icon { width: 22px; height: 22px; }
</style>
