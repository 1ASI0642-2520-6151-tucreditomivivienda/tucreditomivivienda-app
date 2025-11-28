import { defineStore } from 'pinia'
import { login as loginApi } from '../services/authService'

const USER_KEY = 'mv_user'
const TOKEN_KEY = 'mv_token'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem(USER_KEY)) || null,
        token: localStorage.getItem(TOKEN_KEY) || null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        async login({ email, password }) {
            // Validar que los campos no estén vacíos
            if (!email || !password) {
                throw new Error('Por favor ingresa tu correo y contraseña')
            }
            
            // llamamos al backend
            const { token, user } = await loginApi(email, password)

            // opcional: adaptamos nombres de campos
            this.user = {
                id: user.id,
                email: user.email,
                name: user.nombre,
                role: user.rol
            }
            this.token = token

            localStorage.setItem(USER_KEY, JSON.stringify(this.user))
            localStorage.setItem(TOKEN_KEY, this.token)

            return true
        },
        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem(USER_KEY)
            localStorage.removeItem(TOKEN_KEY)
        }
    }
})
