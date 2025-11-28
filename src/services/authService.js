// src/services/authService.js
import { request } from './api'

export async function login(email, password) {
    // POST /api/auth/login
    // Normalizar el email (minúsculas y sin espacios)
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()
    
    const body = { email: normalizedEmail, password: normalizedPassword }
    
    // Log solo en desarrollo
    if (import.meta.env.DEV) {
        console.log('[AuthService] Enviando login:', { 
            email: normalizedEmail, 
            password: '***',
            bodyStringified: JSON.stringify(body)
        })
    }
    
    return await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body)
    })
}
