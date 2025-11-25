// Estructura base de un cliente
export function createEmptyClient() {
    return {
        id: null,
        nombres: '',
        apellidos: '',
        documento: '',
        estadoCivil: '',
        ingresosMensuales: 0,
        dependientes: 0,
        actividadLaboral: '',
        telefono: '',
        email: '',
        unidadInteres: '' // proyecto / depto de interés
    }
}
