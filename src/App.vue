<template>
  <div class="app-shell">
    <main class="app-content">
      <router-view />
    </main>

    <nav class="tab-bar">
      <router-link to="/" class="tab-item" active-class="tab-item--active" exact>
        <span class="tab-icon">🏠</span>
        <span class="tab-label">首页</span>
      </router-link>
      <router-link to="/history" class="tab-item" active-class="tab-item--active">
        <span class="tab-icon">📋</span>
        <span class="tab-label">历史</span>
      </router-link>
      <router-link to="/settings" class="tab-item" active-class="tab-item--active">
        <span class="tab-icon">⚙️</span>
        <span class="tab-label">设置</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: var(--color-bg);
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 64px;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  height: 64px;
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 10px;
  transition: color 0.15s;
}

.tab-item--active {
  color: var(--color-primary);
}

.tab-icon {
  font-size: 20px;
}
</style>
