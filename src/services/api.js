// src/services/api.js

// Quita cualquier "/" final por si acaso
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5129')
    .replace(/\/+$/, '')

// Solo log en desarrollo
if (import.meta.env.DEV) {
    console.log('[API] URL base:', API_BASE_URL)
}

async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    }

    // Log de la petición solo en desarrollo
    if (import.meta.env.DEV) {
        console.log('[API] Request:', {
            url,
            method: options.method || 'GET',
            headers,
            body: options.body
        })
    }

    let response
    try {
        response = await fetch(url, {
            ...options,
            headers
        })
    } catch (err) {
        // Aquí es donde aparece el "Failed to fetch"
        console.error('[API] Network error:', err)
        throw new Error('Error de conexión con el servidor. Verifica que el backend esté corriendo.')
    }

    const text = await response.text()
    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            data = text
        }
    }

    if (!response.ok) {
        let message = `Error ${response.status}: ${response.statusText}`
        
        if (data) {
            if (typeof data === 'object') {
                // Intentar diferentes campos comunes de mensaje de error
                // .NET suele usar 'title', 'errors', o 'message'
                if (data.errors && typeof data.errors === 'object') {
                    // Errores de validación de .NET
                    const errorMessages = Object.values(data.errors).flat()
                    message = errorMessages.join(', ') || data.title || data.message || JSON.stringify(data)
                } else {
                    message = data.message || data.error || data.title || data.detail || JSON.stringify(data)
                }
            } else if (typeof data === 'string') {
                message = data
            }
        }
        
        // Log detallado solo en desarrollo
        if (import.meta.env.DEV) {
            console.group('🔴 [API] Error response')
            console.error('Status:', response.status, response.statusText)
            console.error('URL:', url)
            console.error('Response text (raw):', text)
            console.error('Parsed data:', data)
            console.error('Full data object:', JSON.stringify(data, null, 2))
            if (data && typeof data === 'object') {
                console.error('Error object keys:', Object.keys(data))
                if (data.errors) {
                    console.error('Validation errors:', data.errors)
                }
                // Mostrar todos los campos del objeto de error
                for (const key in data) {
                    console.error(`  ${key}:`, data[key])
                }
            }
            console.groupEnd()
        }
        
        throw new Error(message)
    }

    return data
}

export { API_BASE_URL, request }
