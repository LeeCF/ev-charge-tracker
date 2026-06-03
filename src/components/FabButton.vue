<template>
  <button class="fab" @click="$emit('click')">+</button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 28px;
  line-height: 1;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.4);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
