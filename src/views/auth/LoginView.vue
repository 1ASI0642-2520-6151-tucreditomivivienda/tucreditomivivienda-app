<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

// Credenciales demo del backend
const email = ref('asesor@demo.com')
const password = ref('admin123')
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  try {
    // Eliminar espacios en blanco al inicio y final
    const trimmedEmail = email.value.trim()
    const trimmedPassword = password.value.trim()
    
    await authStore.login({ email: trimmedEmail, password: trimmedPassword })
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
    <!-- Header amarillo -->
    <header class="header">
      <div class="header-left">
        <img src="/home.svg" alt="Logo" class="logo-icon" />
        <div class="logo-text">
          <span class="logo">TuCreditoMiVivienda</span>
          <span class="tagline">Simulador de créditos hipotecarios</span>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="content">
      <div class="login-card">
        <div class="card-header">
          <img src="/home.svg" alt="Logo" class="card-icon" />
          <h1>Iniciar Sesión</h1>
        </div>
        
        <p class="intro-text">
          Accede a tu cuenta para gestionar clientes, unidades y simular créditos hipotecarios.
        </p>

        <p class="mandatory-hint">
          <span class="asterisk">*</span> Indica campo obligatorio
        </p>

        <form @submit.prevent="handleSubmit" class="form">
          <label class="field">
            <span class="label">*Correo Electrónico</span>
            <input 
              v-model="email" 
              type="email" 
              required 
              class="input"
              placeholder="correo@ejemplo.com"
            />
          </label>

          <label class="field">
            <span class="label">*Contraseña</span>
            <div class="password-wrapper">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                class="input password-input"
                placeholder="Ingresa tu contraseña"
              />
              <button 
                type="button" 
                class="password-toggle"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </label>

          <label class="checkbox-field">
            <input type="checkbox" v-model="rememberMe" />
            <span>Recordar datos de usuario</span>
          </label>

          <div class="social-login">
            <button type="button" class="social-btn google" tabindex="-1">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button type="button" class="social-btn apple" tabindex="-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>
          </div>

          <p v-if="errorMessage" class="error">
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>

          <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
        </form>
      </div>

      <!-- Sección de crear cuenta -->
      <div class="signup-card">
        <p class="signup-text">
          ¿Aún no eres miembro de TuCreditoMiVivienda?
        </p>
        <p class="signup-subtext">
          Regístrate ahora y comienza a gestionar créditos hipotecarios de manera eficiente
        </p>
        <button type="button" class="btn-primary" disabled tabindex="-1">
          Crear Cuenta
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f6f6;
}

/* Header amarillo */
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem 1.5rem;
  background: #ffc000;
  border-bottom: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo {
  font-weight: 700;
  font-size: 1.1rem;
  color: #333333;
}

.tagline {
  font-size: 0.85rem;
  color: #333333;
}

/* Contenido principal */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  gap: 1.5rem;
}

/* Card de login */
.login-card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #000000;
  font-weight: 700;
}

.intro-text {
  color: #111827;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.mandatory-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 1.25rem;
}

.asterisk {
  color: #ef4444;
  font-weight: 600;
}

/* Formulario */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  color: #4b5563;
  font-weight: 500;
  font-size: 0.85rem;
}

.input {
  border-radius: 0.5rem;
  border: 1px solid #d0d0d0;
  padding: 0.45rem 0.6rem;
  background: #ffffff;
  color: #333333;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #00c853;
}

.password-wrapper {
  position: relative;
  width: 100%;
}

.password-input {
  width: 100%;
  padding-right: 2.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #111827;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #111827;
  cursor: pointer;
}

.checkbox-field input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.social-login {
  display: flex;
  gap: 0.75rem;
  margin: 0.5rem 0;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.social-btn:hover {
  background: #f3f4f6;
}

.social-btn.apple {
  color: #000000;
}

.error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: -0.5rem;
  padding: 0.5rem;
  background: #fef2f2;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: none;
  background: #00c853;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: #00b34a;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: default;
}

.forgot-password {
  text-align: center;
  color: #00c853;
  font-size: 0.85rem;
  text-decoration: none;
  margin-top: 0.5rem;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #00b34a;
  text-decoration: underline;
}

/* Card de registro */
.signup-card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e5e5;
  padding: 1.5rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.signup-text {
  color: #111827;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.signup-subtext {
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.signup-card .btn-primary {
  margin-top: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .login-card,
  .signup-card {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.25rem;
  }
}
</style>
