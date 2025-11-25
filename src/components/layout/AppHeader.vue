<script setup>
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="header">
    <div class="header-left">
      <span class="logo">TuCreditoMiVivienda</span>
      <span class="tagline">Simulador de créditos hipotecarios</span>
    </div>

    <div class="header-right" v-if="authStore.isAuthenticated">
      <span class="user-name">{{ authStore.user?.name }}</span>
      <button class="btn-outline" @click="handleLogout">Cerrar sesión</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: #ffc000;          /* amarillo de tu Figma */
  border-bottom: none;          /* opcional */
}


.header-left {
  display: flex;
  flex-direction: column;
}

.logo {
  font-weight: 700;
  font-size: 1.1rem;
  color: #333333;               /* texto oscuro */
}

.tagline {                      /* si tienes subtítulo */
  font-size: 0.85rem;
  color: #333333;
}


.header-right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.user-name {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 600;
}

.btn-outline {
  border: 1px solid #4b5563;
  background: #000000;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  color: #ffffff;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn-outline:hover {
  border-color: #6366f1;
}
</style>
