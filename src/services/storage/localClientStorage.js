const STORAGE_KEY = 'mv_clients'

export function getAllClients() {
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

export function saveAllClients(clients) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}
