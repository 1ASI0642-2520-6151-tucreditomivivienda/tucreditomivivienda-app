// src/services/propertyService.js
import { request } from './api'

export async function fetchProperties() {
    return await request('/api/properties')
}

export async function getPropertyById(id) {
    return await request(`/api/properties/${id}`)
}

export async function createProperty(data) {
    return await request('/api/properties', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export async function updateProperty(id, data) {
    return await request(`/api/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
}

export async function deleteProperty(id) {
    await request(`/api/properties/${id}`, {
        method: 'DELETE'
    })
}
