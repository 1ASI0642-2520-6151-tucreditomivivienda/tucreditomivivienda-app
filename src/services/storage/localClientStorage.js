const STORAGE_KEY = 'mv_clients'

const DEFAULT_CLIENTS = [
    {
        id: 'cli-1',
        nombres: 'María Fernanda',
        apellidos: 'Gonzales Rivas',
        documento: '74561234',
        estadoCivil: 'soltero',
        ingresosMensuales: 3200,
        dependientes: 1,
        actividadLaboral: 'Empleado dependiente',
        telefono: '987654321',
        email: 'maria.gonzales@example.com',
        unidadInteres: 'Proyecto Sol de Surco - Torre A, Dpto 402'
    },
    {
        id: 'cli-2',
        nombres: 'Juan Carlos',
        apellidos: 'Ramírez López',
        documento: '70894561',
        estadoCivil: 'casado',
        ingresosMensuales: 5800,
        dependientes: 2,
        actividadLaboral: 'Independiente',
        telefono: '956123789',
        email: 'juan.ramirez@example.com',
        unidadInteres: 'Residencial Primavera - Dpto 201'
    },
    {
        id: 'cli-3',
        nombres: 'Ana Lucía',
        apellidos: 'Torres Vega',
        documento: '72345678',
        estadoCivil: 'conviviente',
        ingresosMensuales: 4200,
        dependientes: 1,
        actividadLaboral: 'Empleado público',
        telefono: '999888777',
        email: 'ana.torres@example.com',
        unidadInteres: 'Edificio Central - Dpto 803'
    },
    {
        id: 'cli-4',
        nombres: 'Pedro Miguel',
        apellidos: 'Soto Huamán',
        documento: '73456789',
        estadoCivil: 'soltero',
        ingresosMensuales: 2900,
        dependientes: 0,
        actividadLaboral: 'Técnico de mantenimiento',
        telefono: '912345678',
        email: 'pedro.soto@example.com',
        unidadInteres: 'Condominio Los Álamos - Casa 15'
    }
]

export function getAllClients() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
        // Primera vez: sembramos datos demo en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLIENTS))
        return DEFAULT_CLIENTS
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
