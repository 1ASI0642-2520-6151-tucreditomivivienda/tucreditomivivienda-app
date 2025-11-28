// src/stores/loanStore.js
import { defineStore } from 'pinia'
import {
    fetchSimulations,
    deleteSimulation as deleteSimulationApi
} from '../services/loanService'

export const useLoanStore = defineStore('loan', {
    state: () => ({
        currentSimulation: null,
        history: [],
        loadingHistory: false,
        error: null
    }),
    actions: {
        setSimulation(simulation) {
            this.currentSimulation = simulation
        },
        clearSimulation() {
            this.currentSimulation = null
        },
        async loadHistory() {
            this.loadingHistory = true
            this.error = null
            try {
                this.history = await fetchSimulations()
            } catch (err) {
                this.error = err.message || 'Error al cargar el historial'
            } finally {
                this.loadingHistory = false
            }
        },
        async removeSimulation(id) {
            try {
                await deleteSimulationApi(id)
                this.history = this.history.filter(s => s.id !== id)
            } catch (err) {
                throw new Error(err.message || 'Error al eliminar la simulación')
            }
        }
    }
})
