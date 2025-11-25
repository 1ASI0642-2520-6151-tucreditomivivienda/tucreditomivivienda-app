import { defineStore } from 'pinia'
import {
    fetchClients,
    createClient,
    updateClient,
    deleteClient
} from '../services/clientService'

export const useClientStore = defineStore('clients', {
    state: () => ({
        items: [],
        loading: false,
        error: null
    }),
    getters: {
        sortedClients: (state) =>
            [...state.items].sort((a, b) => a.apellidos.localeCompare(b.apellidos))
    },
    actions: {
        async loadClients() {
            this.loading = true
            this.error = null
            try {
                this.items = await fetchClients()
            } catch (err) {
                this.error = err.message || 'Error al cargar clientes'
            } finally {
                this.loading = false
            }
        },
        async addClient(data) {
            const created = await createClient(data)
            this.items.push(created)
            return created
        },
        async updateClient(id, data) {
            const updated = await updateClient(id, data)
            const index = this.items.findIndex((c) => c.id === id)
            if (index !== -1) this.items[index] = updated
            return updated
        },
        async removeClient(id) {
            await deleteClient(id)
            this.items = this.items.filter((c) => c.id !== id)
        },
        getById(id) {
            return this.items.find((c) => c.id === id) || null
        }
    }
})
