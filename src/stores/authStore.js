import { defineStore } from 'pinia'

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
            // LOGIN FALSO por ahora (luego se reemplaza por backend)
            const demoEmail = 'demo@inmobiliaria.com'
            const demoPassword = '123456'

            if (email === demoEmail && password === demoPassword) {
                const fakeToken = 'fake-jwt-token'

                this.user = {
                    email,
                    name: 'Asesor MiVivienda Demo'
                }
                this.token = fakeToken

                localStorage.setItem(USER_KEY, JSON.stringify(this.user))
                localStorage.setItem(TOKEN_KEY, fakeToken)

                return true
            }

            throw new Error('Credenciales incorrectas')
        },
        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem(USER_KEY)
            localStorage.removeItem(TOKEN_KEY)
        }
    }
})
