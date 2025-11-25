// Estructura base de una unidad inmobiliaria
export function createEmptyProperty() {
    return {
        id: null,
        proyecto: '',
        torre: '',
        numero: '',
        ciudad: '',
        tipoUnidad: '', // Departamento, Casa, Dúplex, etc.
        areaM2: 0,
        dormitorios: 0,
        banos: 0,
        precioVenta: 0,
        estado: 'disponible' // disponible | reservado | vendido
    }
}
