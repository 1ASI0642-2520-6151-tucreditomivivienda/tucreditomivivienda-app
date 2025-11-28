// src/services/clientService.js
import { request } from './api'

export async function fetchClients() {
    return await request('/api/clients')
}

export async function getClientById(id) {
    return await request(`/api/clients/${id}`)
}

export async function createClient(data) {
    return await request('/api/clients', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export async function updateClient(id, data) {
    return await request(`/api/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
}

export async function deleteClient(id) {
    await request(`/api/clients/${id}`, {
        method: 'DELETE'
    })
}
