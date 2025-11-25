const STORAGE_KEY = 'mv_properties'

const DEFAULT_PROPERTIES = [
    {
        id: 'prop-1',
        proyecto: 'Residencial Los Cedros',
        torre: 'Torre A',
        numero: '402',
        ciudad: 'Lima',
        tipoUnidad: 'departamento',
        areaM2: 75,
        dormitorios: 3,
        banos: 2,
        precioVenta: 320000,
        estado: 'disponible'
    },
    {
        id: 'prop-2',
        proyecto: 'Residencial Los Cedros',
        torre: 'Torre B',
        numero: '201',
        ciudad: 'Lima',
        tipoUnidad: 'departamento',
        areaM2: 60,
        dormitorios: 2,
        banos: 2,
        precioVenta: 280000,
        estado: 'reservado'
    },
    {
        id: 'prop-3',
        proyecto: 'Condominio El Mirador',
        torre: 'Casa',
        numero: '15',
        ciudad: 'Arequipa',
        tipoUnidad: 'casa',
        areaM2: 95,
        dormitorios: 3,
        banos: 3,
        precioVenta: 360000,
        estado: 'disponible'
    },
    {
        id: 'prop-4',
        proyecto: 'Edificio Central',
        torre: 'Torre Única',
        numero: '803',
        ciudad: 'Trujillo',
        tipoUnidad: 'departamento',
        areaM2: 85,
        dormitorios: 3,
        banos: 2,
        precioVenta: 340000,
        estado: 'vendido'
    }
]

export function getAllProperties() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROPERTIES))
        return DEFAULT_PROPERTIES
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
