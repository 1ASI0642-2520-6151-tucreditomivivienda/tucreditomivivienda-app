import { defineStore } from 'pinia'

const CONFIG_KEY = 'mv_config'

const defaultConfig = () => ({
    currency: 'PEN',           // PEN = Soles, USD = Dólares
    rateType: 'efectiva',      // 'efectiva' | 'nominal'
    rateValue: 12,             // tasa anual en %
    capitalization: 'mensual', // solo aplica si es nominal
    termMonths: 240,           // 20 años
    graceType: 'sin',          // 'sin' | 'total' | 'parcial'
    graceMonths: 0
})

export const useConfigStore = defineStore('config', {
    state: () => ({
        config: loadFromStorage()
    }),
    getters: {
        // accesos rápidos si necesitas
        currencyLabel: (state) =>
            state.config.currency === 'PEN' ? 'Soles' : 'Dólares'
    },
    actions: {
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig }
            localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config))
        },
        resetConfig() {
            this.config = defaultConfig()
            localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config))
        }
    }
})

function loadFromStorage() {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaultConfig()
    try {
        const parsed = JSON.parse(raw)
        return { ...defaultConfig(), ...parsed }
    } catch {
        return defaultConfig()
    }
}
