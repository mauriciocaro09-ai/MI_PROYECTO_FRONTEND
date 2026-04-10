// ============================================
// CONSTANTES DEL SISTEMA
// ============================================

// Estados de habitaciones
const ESTADOS_HABITACION = {
    DISPONIBLE: 'disponible',
    OCUPADA: 'ocupada',
    MANTENIMIENTO: 'mantenimiento',
    RESERVADA: 'reservada'
};

// Tipos de documento
const TIPOS_DOCUMENTO = {
    CC: 'Cédula de Ciudadanía',
    CE: 'Cédula de Extranjería',
    TI: 'Tarjeta de Identidad',
    PP: 'Pasaporte'
};

// Métodos de pago
const METODOS_PAGO = {
    EFECTIVO: 'efectivo',
    TARJETA: 'tarjeta',
    TRANSFERENCIA: 'transferencia',
    PSE: 'pse'
};

// Mensajes de la aplicación
const MENSAJES = {
    CARGANDO: 'Cargando...',
    ERROR_CARGAR: 'Error al cargar los datos',
    NO_DATOS: 'No hay datos disponibles',
    EXITO_CREAR: 'Registro creado exitosamente',
    EXITO_ACTUALIZAR: 'Registro actualizado exitosamente',
    EXITO_ELIMINAR: 'Registro eliminado exitosamente',
    ERROR_CREAR: 'Error al crear el registro',
    ERROR_ACTUALIZAR: 'Error al actualizar el registro',
    ERROR_ELIMINAR: 'Error al eliminar el registro',
    CONFIRMAR_ELIMINAR: '¿Estás seguro de que deseas eliminar este registro?'
};

// Configuración de paginación
const PAGINACION = {
    ELEMENTOS_POR_PAGINA: 10,
    PAGINA_ACTUAL: 1
};

// Formatos de fecha
const FORMATOS_FECHA = {
    CORTO: 'DD/MM/YYYY',
    LARGO: 'DD de MMMM de YYYY',
    COMPLETO: 'DD/MM/YYYY HH:mm:ss'
};

// Exportar constantes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ESTADOS_HABITACION,
        TIPOS_DOCUMENTO,
        METODOS_PAGO,
        MENSAJES,
        PAGINACION,
        FORMATOS_FECHA
    };
}
