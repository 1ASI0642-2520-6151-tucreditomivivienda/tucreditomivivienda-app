const STORAGE_KEY = 'mv_properties'

export function getAllProperties() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
        // Retornar array vacío en lugar de datos demo
        return []
    }
    try {
        return JSON.parse(raw)
    } catch {
        return []
    }
}

export function saveAllProperties(properties) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties))
}
