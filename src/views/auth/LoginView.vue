<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const email = ref('demo@inmobiliaria.com')
const password = ref('123456')
const loading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push({ name: 'dashboard' })
  } catch (err) {
    errorMessage.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="card">
      <h1>Ingresar</h1>
      <p class="subtitle">Accede al simulador MiVivienda de la inmobiliaria</p>

      <form @submit.prevent="handleSubmit" class="form">
        <label>
          Correo
          <input v-model="email" type="email" required />
        </label>

        <label>
          Contraseña
          <input v-model="password" type="password" required />
        </label>

        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Entrar' }}
        </button>

        <p class="hint">
          Prueba con <strong>demo@inmobiliaria.com</strong> / <strong>123456</strong>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top, #4f46e5 0, #020617 55%);
}

.card {
  background: #020617020617;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.subtitle {
  margin-top: 0.25rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #9ca3af;
}

.form label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

input {
  width: 100%;
  margin-top: 0.2rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #4b5563;
  background: #020617;
  color: #e5e7eb;
}

input:focus {
  outline: none;
  border-color: #6366f1;
}

button {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.75rem;
  border: none;
  background: linear-gradient(90deg, #4f46e5, #6366f1);
  color: white;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: #fca5a5;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.75rem;
  text-align: center;
}
</style>
