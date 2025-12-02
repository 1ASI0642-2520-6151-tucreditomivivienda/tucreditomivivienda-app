// src/services/loanService.js

// Convierte la configuración de tasa anual (efectiva o nominal) a tasa mensual
export function getMonthlyRate(config) {
    const rate = Number(config.rateValue) / 100
    if (rate <= 0) return 0

    if (config.rateType === 'efectiva') {
        // TEA -> tasa mensual
        return Math.pow(1 + rate, 1 / 12) - 1
    }

    // TNA -> TEA -> mensual, según capitalización
    const m = getCapitalizationsPerYear(config.capitalization)
    const tea = Math.pow(1 + rate / m, m) - 1
    return Math.pow(1 + tea, 1 / 12) - 1
}

function getCapitalizationsPerYear(capitalization) {
    switch (capitalization) {
        case 'mensual':
            return 12
        case 'bimestral':
            return 6
        case 'trimestral':
            return 4
        case 'semestral':
            return 2
        case 'anual':
        default:
            return 1
    }
}

// Cuota del método francés
function frenchInstallment(principal, monthlyRate, periods) {
    if (periods <= 0) return 0
    if (monthlyRate === 0) {
        return principal / periods
    }
    const i = monthlyRate
    return (principal * i) / (1 - Math.pow(1 + i, -periods))
}

// VAN de los flujos (tasa por periodo)
function calculateNPV(ratePerPeriod, cashFlows) {
    let npv = 0
    for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + ratePerPeriod, t)
    }
    return npv
}

// TIR mediante bisección (entre 0% y 100% mensual)
function calculateIRR(cashFlows) {
    let low = 0
    let high = 1
    const tolerance = 1e-7
    const maxIterations = 100

    let irr = null

    for (let iter = 0; iter < maxIterations; iter++) {
        const mid = (low + high) / 2
        const npvMid = calculateNPV(mid, cashFlows)

        if (Math.abs(npvMid) < tolerance) {
            irr = mid
            break
        }

        const npvLow = calculateNPV(low, cashFlows)

        if (npvLow * npvMid < 0) {
            high = mid
        } else {
            low = mid
        }
    }

    return irr
}

/**
 * Genera el plan de pagos francés (con gracia opcional).
 * Interpretación: termMonths (del config) incluye los meses de gracia.
 *
 * @param {number} principal  Monto financiado
 * @param {object} config     Configuración (de configStore)
 * @returns {{schedule: Array, summary: object, cashFlows: Array}}
 */
export function generateFrenchSchedule(principal, config) {
    const termMonths = Number(config.termMonths)
    let graceMonths = Number(config.graceMonths) || 0
    const graceType = config.graceType

    if (graceMonths < 0) graceMonths = 0
    if (graceMonths > termMonths) graceMonths = termMonths

    const monthlyRate = getMonthlyRate(config)

    const schedule = []
    const cashFlows = []

    // flujos de caja desde el punto de vista del banco:
    // t0: desembolso del préstamo (negativo)
    cashFlows.push(-principal)

    let balance = principal
    let period = 1

    // 1) Meses de gracia (si los hay)
    if (graceType === 'total' && graceMonths > 0) {
        // Gracia total: no se paga nada, los intereses se capitalizan
        // En la tabla no se muestra el interés porque no se paga, solo se capitaliza
        for (let g = 0; g < graceMonths; g++) {
            const saldoInicial = balance
            // El saldo final se calcula capitalizando: Saldo Final = Saldo Inicial * (1 + tasa)
            const saldoFinal = saldoInicial * (1 + monthlyRate)
            const cuota = 0
            const amortizacion = 0
            // El interés no se muestra en la tabla durante gracia total (se muestra como 0)
            const interes = 0

            schedule.push({
                period,
                saldoInicial,
                cuota,
                interes,
                amortizacion,
                saldoFinal
            })

            cashFlows.push(cuota) // 0

            balance = saldoFinal
            period++
        }
    } else if (graceType === 'parcial' && graceMonths > 0) {
        // Gracia parcial: se pagan solo intereses, no se amortiza
        for (let g = 0; g < graceMonths; g++) {
            const saldoInicial = balance
            const interes = saldoInicial * monthlyRate
            const cuota = interes
            const amortizacion = 0
            const saldoFinal = saldoInicial

            schedule.push({
                period,
                saldoInicial,
                cuota,
                interes,
                amortizacion,
                saldoFinal
            })

            cashFlows.push(cuota)

            balance = saldoFinal
            period++
        }
    }

    // 2) Tramo francés (sin gracia) para el resto del plazo
    const remainingMonths = termMonths - graceMonths
    if (remainingMonths > 0) {
        const cuota = frenchInstallment(balance, monthlyRate, remainingMonths)

        for (let k = 0; k < remainingMonths; k++) {
            const saldoInicial = balance
            const interes = saldoInicial * monthlyRate
            const amortizacion = cuota - interes
            const saldoFinal = saldoInicial - amortizacion

            schedule.push({
                period,
                saldoInicial,
                cuota,
                interes,
                amortizacion,
                saldoFinal
            })

            cashFlows.push(cuota)

            balance = saldoFinal
            period++
        }
    }

    // 3) Totales y métricas
    const totalPaid = schedule.reduce((sum, row) => sum + row.cuota, 0)
    const totalInterest = schedule.reduce((sum, row) => sum + row.interes, 0)

    const npv = calculateNPV(monthlyRate, cashFlows)
    const irrMonthly = calculateIRR(cashFlows)
    const irrAnnual =
        irrMonthly != null ? Math.pow(1 + irrMonthly, 12) - 1 : null

    const summary = {
        principal,
        termMonths,
        monthlyRate: monthlyRate * 100, // Guardar como porcentaje para consistencia
        totalPaid,
        totalInterest,
        npv,
        irrMonthly,
        irrAnnual
    }

    return { schedule, summary, cashFlows }
}

// ========== API Functions ==========
import { request } from './api'

/**
 * Obtiene todas las simulaciones guardadas (historial)
 */
export async function fetchSimulations() {
    return await request('/api/loans/simulations')
}

/**
 * Obtiene una simulación específica por ID
 */
export async function getSimulationById(id) {
    return await request(`/api/loans/simulations/${id}`)
}

/**
 * Elimina una simulación
 */
export async function deleteSimulation(id) {
    await request(`/api/loans/simulations/${id}`, {
        method: 'DELETE'
    })
}

/**
 * Calcula y guarda una simulación en el backend
 * El backend calcula con gracia y devuelve el resultado completo
 */
export async function simulateAndSave(principal, config, clientId = null, propertyId = null) {
    const payload = {
        principal: principal,
        config: {
            currency: config.currency || 'PEN',
            rateType: config.rateType || 'efectiva',
            rateValue: config.rateValue || 12,
            capitalization: config.capitalization || 'mensual',
            termMonths: config.termMonths || 240,
            graceType: config.graceType || 'sin',
            graceMonths: config.graceMonths || 0
        },
        clientId: clientId,
        propertyId: propertyId
    }
    
    // El backend calcula y guarda automáticamente
    return await request('/api/loans/simulate', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

/**
 * Adapta el resultado del backend al formato del frontend
 * El backend devuelve propiedades en PascalCase (Month, Payment, etc.)
 */
export function adaptBackendResult(backendResult, inputData) {
    // El backend puede devolver en PascalCase o camelCase, manejamos ambos
    const summary = backendResult.summary || backendResult.Summary || {}
    const schedule = backendResult.schedule || backendResult.Schedule || []
    
    // Obtener configuración de gracia del inputData
    const config = inputData?.configSnapshot || {}
    const graceType = config.graceType || 'sin'
    const graceMonths = Number(config.graceMonths) || 0
    
    // Calcular tasa mensual desde la configuración original (más confiable que el summary del backend)
    // El backend siempre devuelve MonthlyRate como porcentaje (ej: 0.72 para 0.72%)
    const monthlyRateFromSummary = summary.monthlyRate || summary.MonthlyRate || 0
    // El backend devuelve la tasa como porcentaje, siempre dividir por 100
    let monthlyRate = monthlyRateFromSummary / 100
    
    // Si no hay tasa en el summary, calcularla desde la configuración
    if (!monthlyRateFromSummary && inputData?.configSnapshot) {
        monthlyRate = getMonthlyRate(inputData.configSnapshot)
    }
    
    // Adaptar schedule del backend al formato del frontend
    let previousBalance = summary.principal || summary.Principal || 0
    const adaptedSchedule = schedule.map((payment, index) => {
        // Manejar tanto camelCase como PascalCase
        const month = payment.month || payment.Month || 0
        const paymentAmount = payment.payment || payment.Payment || 0
        let interest = payment.interest || payment.Interest || 0
        let principalPaid = payment.principalPaid || payment.PrincipalPaid || 0
        let balance = payment.balance || payment.Balance || 0
        
        const saldoInicial = previousBalance
        
        // Corregir valores durante periodo de gracia TOTAL
        // En gracia total: interés = 0, cuota = 0, amortización = 0, saldo final se capitaliza
        if (graceType === 'total' && index < graceMonths) {
            interest = 0  // No se muestra interés durante gracia total
            principalPaid = 0  // No hay amortización
            // El saldo final se calcula capitalizando: Saldo Final = Saldo Inicial * (1 + TEM)
            // TEM es un decimal (ej: 0.0072 para 0.72%), no un porcentaje
            balance = saldoInicial * (1 + monthlyRate)
        }
        
        previousBalance = balance
        
        return {
            period: month,
            saldoInicial: saldoInicial,
            cuota: graceType === 'total' && index < graceMonths ? 0 : paymentAmount,
            interes: interest,
            amortizacion: principalPaid,
            saldoFinal: balance
        }
    })

    // Calcular cashFlows para VAN y TIR
    const principal = summary.principal || summary.Principal || 0
    const cashFlows = [-principal]
    adaptedSchedule.forEach(payment => {
        cashFlows.push(payment.cuota || 0)
    })

    // Calcular VAN y TIR
    const npv = calculateNPV(monthlyRate, cashFlows)
    const irrMonthly = calculateIRR(cashFlows)
    const irrAnnual = irrMonthly != null ? Math.pow(1 + irrMonthly, 12) - 1 : null

    // Recalcular totales basados en el schedule corregido
    const totalPaid = adaptedSchedule.reduce((sum, row) => sum + row.cuota, 0)
    const totalInterest = adaptedSchedule.reduce((sum, row) => sum + row.interes, 0)

    // Adaptar summary (monthlyRate como porcentaje para consistencia)
    const adaptedSummary = {
        principal: principal,
        termMonths: summary.termMonths || summary.TermMonths || 0,
        monthlyRate: monthlyRate * 100, // Convertir a porcentaje para consistencia
        totalPaid: totalPaid,
        totalInterest: totalInterest,
        npv: npv,
        irrMonthly: irrMonthly,
        irrAnnual: irrAnnual
    }

    return {
        input: inputData,
        schedule: adaptedSchedule,
        summary: adaptedSummary,
        cashFlows
    }
}