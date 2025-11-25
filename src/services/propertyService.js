import {
    getAllProperties,
    saveAllProperties
} from './storage/localPropertyStorage'

function generateId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID()
    }
    return Date.now().toString() + Math.random().toString(16).slice(2)
}

export async function fetchProperties() {
    return getAllProperties()
}

export async function getPropertyById(id) {
    const properties = getAllProperties()
    return properties.find((p) => p.id === id) || null
}

export async function createProperty(data) {
    const properties = getAllProperties()
    const id = generateId()
    const newProperty = { ...data, id }
    properties.push(newProperty)
    saveAllProperties(properties)
    return newProperty
}

export async function updateProperty(id, data) {
    const properties = getAllProperties()
    const index = properties.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Unidad no encontrada')
    const updated = { ...properties[index], ...data, id }
    properties[index] = updated
    saveAllProperties(properties)
    return updated
}

export async function deleteProperty(id) {
    const properties = getAllProperties().filter((p) => p.id !== id)
    saveAllProperties(properties)
}
