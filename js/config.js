// ============================================
// CONFIGURACIÓN DE LA API
// ============================================

const CONFIG = {
    // URL base del backend
    API_URL: 'http://localhost:3000/api',
    
    // Timeout para peticiones fetch (en milisegundos)
    FETCH_TIMEOUT: 10000,
    
    // Habilitar logs en consola
    ENABLE_LOGS: true,
    
    // Usar datos mock (false = usar backend real)
    USE_MOCK_DATA: false,
    
    // Configuración de la aplicación
    APP_NAME: 'Hospedaje Digital',
    VERSION: '1.0.0'
};

// Exportar configuración (para uso en módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
