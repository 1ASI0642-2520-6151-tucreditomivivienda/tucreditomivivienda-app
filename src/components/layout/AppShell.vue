<script setup>
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>

<template>
  <div class="layout">
    <AppHeader />

    <div class="layout-body">
      <AppSidebar />

      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0f172a; /* fondo oscuro */
  color: #e5e7eb;
}

.layout-body {
  display: flex;
  flex: 1;
}

.layout-content {
  flex: 1;
  padding: 1.5rem;
  background: #f5f5f5; /* gris clarito como el fondo de tu Figma */
  overflow-y: auto;
}


</style>
