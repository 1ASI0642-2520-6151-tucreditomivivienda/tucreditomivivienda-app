import { getAllClients, saveAllClients } from './storage/localClientStorage'

function generateId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID()
    }
    return Date.now().toString() + Math.random().toString(16).slice(2)
}

export async function fetchClients() {
    return getAllClients()
}

export async function getClientById(id) {
    const clients = getAllClients()
    return clients.find((c) => c.id === id) || null
}

export async function createClient(data) {
    const clients = getAllClients()
    const id = generateId()
    const newClient = { ...data, id }
    clients.push(newClient)
    saveAllClients(clients)
    return newClient
}

export async function updateClient(id, data) {
    const clients = getAllClients()
    const index = clients.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Cliente no encontrado')
    const updated = { ...clients[index], ...data, id }
    clients[index] = updated
    saveAllClients(clients)
    return updated
}

export async function deleteClient(id) {
    const clients = getAllClients().filter((c) => c.id !== id)
    saveAllClients(clients)
}
