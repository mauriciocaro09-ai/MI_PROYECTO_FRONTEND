// ============================================
// FUNCIONES DE API - Con soporte para Mock Data
// ============================================

// Verificar si estamos usando datos mock
const useMockData = typeof CONFIG !== 'undefined' && CONFIG.USE_MOCK_DATA;

// Logger condicional
const apiLogger = {
    log: (...args) => {
        if (typeof CONFIG !== 'undefined' && CONFIG.ENABLE_LOGS) {
            console.log('[API]', ...args);
        }
    },
    error: (...args) => {
        console.error('[API ERROR]', ...args);
    }
};

// ============================================
// FUNCIONES PARA HABITACIONES
// ============================================

// Obtener todas las habitaciones
async function obtenerHabitaciones() {
    apiLogger.log('Obteniendo habitaciones...');
    
    // Si usamos datos mock, retornar datos de ejemplo
    if (useMockData) {
        apiLogger.log('Usando datos mock para habitaciones');
        return await getMockData('habitaciones');
    }
    
    // Intentar obtener del backend
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG?.FETCH_TIMEOUT || 5000);
        
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/habitaciones`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Error al obtener habitaciones');
        const data = await response.json();
        apiLogger.log('Habitaciones obtenidas del backend:', data.length);
        return data;
    } catch (error) {
        apiLogger.error('Error al obtener habitaciones:', error.message);
        // Fallback a datos mock
        apiLogger.log('Fallback a datos mock');
        return await getMockData('habitaciones');
    }
}

// Obtener una habitación por ID
async function obtenerHabitacionPorId(id) {
    apiLogger.log('Obteniendo habitación por ID:', id);
    
    if (useMockData) {
        const habitaciones = await getMockData('habitaciones');
        return habitaciones.find(h => h.id == id || h.IDHabitacion == id) || null;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG?.FETCH_TIMEOUT || 5000);
        
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/habitaciones/${id}`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Error al obtener habitación');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al obtener habitación:', error.message);
        const habitaciones = await getMockData('habitaciones');
        return habitaciones.find(h => h.id == id || h.IDHabitacion == id) || null;
    }
}

// Crear nueva habitación
async function crearHabitacion(habitacion) {
    apiLogger.log('Creando habitación:', habitacion);
    
    if (useMockData) {
        return await createMockItem('habitaciones', habitacion);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/habitaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habitacion)
        });
        if (!response.ok) throw new Error('Error al crear habitación');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al crear habitación:', error.message);
        return await createMockItem('habitaciones', habitacion);
    }
}

// Actualizar habitación
async function actualizarHabitacion(id, habitacion) {
    apiLogger.log('Actualizando habitación:', id, habitacion);
    
    if (useMockData) {
        return await updateMockItem('habitaciones', id, habitacion);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/habitaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habitacion)
        });
        if (!response.ok) throw new Error('Error al actualizar habitación');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al actualizar habitación:', error.message);
        return await updateMockItem('habitaciones', id, habitacion);
    }
}

// Eliminar habitación
async function eliminarHabitacion(id) {
    apiLogger.log('Eliminando habitación:', id);
    
    if (useMockData) {
        return await deleteMockItem('habitaciones', id);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/habitaciones/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar habitación');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al eliminar habitación:', error.message);
        return await deleteMockItem('habitaciones', id);
    }
}

// ============================================
// FUNCIONES PARA CLIENTES
// ============================================

// Obtener todos los clientes
async function obtenerClientes() {
    apiLogger.log('Obteniendo clientes...');
    
    if (useMockData) {
        apiLogger.log('Usando datos mock para clientes');
        return await getMockData('clientes');
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG?.FETCH_TIMEOUT || 5000);
        
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/clientes`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Error al obtener clientes');
        const data = await response.json();
        apiLogger.log('Clientes obtenidos del backend:', data.length);
        return data;
    } catch (error) {
        apiLogger.error('Error al obtener clientes:', error.message);
        return await getMockData('clientes');
    }
}

// Obtener un cliente por ID
async function obtenerClientePorId(id) {
    apiLogger.log('Obteniendo cliente por ID:', id);
    
    if (useMockData) {
        const clientes = await getMockData('clientes');
        return clientes.find(c => c.id == id || c.IDCliente == id) || null;
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/clientes/${id}`);
        if (!response.ok) throw new Error('Error al obtener cliente');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al obtener cliente:', error.message);
        const clientes = await getMockData('clientes');
        return clientes.find(c => c.id == id || c.IDCliente == id) || null;
    }
}

// Crear nuevo cliente
async function crearCliente(cliente) {
    apiLogger.log('Creando cliente:', cliente);
    
    if (useMockData) {
        return await createMockItem('clientes', cliente);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        if (!response.ok) throw new Error('Error al crear cliente');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al crear cliente:', error.message);
        return await createMockItem('clientes', cliente);
    }
}

// Actualizar cliente
async function actualizarCliente(id, cliente) {
    apiLogger.log('Actualizando cliente:', id, cliente);
    
    if (useMockData) {
        return await updateMockItem('clientes', id, cliente);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/clientes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        if (!response.ok) throw new Error('Error al actualizar cliente');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al actualizar cliente:', error.message);
        return await updateMockItem('clientes', id, cliente);
    }
}

// Eliminar cliente
async function eliminarCliente(id) {
    apiLogger.log('Eliminando cliente:', id);
    
    if (useMockData) {
        return await deleteMockItem('clientes', id);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/clientes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar cliente');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al eliminar cliente:', error.message);
        return await deleteMockItem('clientes', id);
    }
}

// ============================================
// FUNCIONES PARA RESERVAS
// ============================================

// Obtener todas las reservas
async function obtenerReservas() {
    apiLogger.log('Obteniendo reservas...');
    
    if (useMockData) {
        apiLogger.log('Usando datos mock para reservas');
        return await getMockData('reservas');
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG?.FETCH_TIMEOUT || 5000);
        
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/reservas`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Error al obtener reservas');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al obtener reservas:', error.message);
        return await getMockData('reservas');
    }
}

// Obtener una reserva por ID
async function obtenerReservaPorId(id) {
    apiLogger.log('Obteniendo reserva por ID:', id);
    
    if (useMockData) {
        const reservas = await getMockData('reservas');
        return reservas.find(r => r.id == id || r.IDReserva == id) || null;
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/reservas/${id}`);
        if (!response.ok) throw new Error('Error al obtener reserva');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al obtener reserva:', error.message);
        const reservas = await getMockData('reservas');
        return reservas.find(r => r.id == id || r.IDReserva == id) || null;
    }
}

// Crear nueva reserva
async function crearReserva(reserva) {
    apiLogger.log('Creando reserva:', reserva);
    
    if (useMockData) {
        return await createMockItem('reservas', reserva);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva)
        });
        if (!response.ok) throw new Error('Error al crear reserva');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al crear reserva:', error.message);
        return await createMockItem('reservas', reserva);
    }
}

// Actualizar reserva
async function actualizarReserva(id, reserva) {
    apiLogger.log('Actualizando reserva:', id, reserva);
    
    if (useMockData) {
        return await updateMockItem('reservas', id, reserva);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/reservas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva)
        });
        if (!response.ok) throw new Error('Error al actualizar reserva');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al actualizar reserva:', error.message);
        return await updateMockItem('reservas', id, reserva);
    }
}

// Eliminar reserva
async function eliminarReserva(id) {
    apiLogger.log('Eliminando reserva:', id);
    apiLogger.log('USE_MOCK_DATA:', useMockData);
    apiLogger.log('API_URL:', CONFIG?.API_URL);

    if (useMockData) {
        apiLogger.log('Usando datos mock para eliminar reserva');
        return await deleteMockItem('reservas', id);
    }

    try {
        const url = `${CONFIG?.API_URL || 'http://localhost:3000/api'}/reservas/${id}`;
        apiLogger.log('URL de eliminación:', url);

        const response = await fetch(url, {
            method: 'DELETE'
        });

        apiLogger.log('Respuesta de eliminación - Status:', response.status, 'StatusText:', response.statusText);
        apiLogger.log('Respuesta completa:', response);

        if (!response.ok) {
            throw new Error(`Error al eliminar reserva: ${response.status} ${response.statusText}`);
        }

        // Para DELETE, algunas APIs devuelven 204 No Content (sin body)
        // otras devuelven un JSON con confirmación
        let result;
        try {
            result = await response.json();
            apiLogger.log('Body de respuesta JSON:', result);
        } catch (e) {
            // Si no hay body JSON, asumimos éxito
            result = { success: true, message: 'Reserva eliminada' };
            apiLogger.log('No hay body JSON, asumiendo éxito');
        }

        apiLogger.log('Retornando resultado:', result);
        return result;
    } catch (error) {
        apiLogger.error('Error al eliminar reserva:', error.message);
        apiLogger.log('Cayendo en datos mock como fallback');

        const mockResult = await deleteMockItem('reservas', id);
        apiLogger.log('Resultado de mock fallback:', mockResult);

        return mockResult;
    }
}

// ============================================
// FUNCIONES PARA SERVICIOS
// ============================================

// Obtener todos los servicios
async function obtenerServicios() {
    apiLogger.log('Obteniendo servicios...');
    
    if (useMockData) {
        apiLogger.log('Usando datos mock para servicios');
        return await getMockData('servicios');
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG?.FETCH_TIMEOUT || 5000);
        
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/servicios`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Error al obtener servicios');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al obtener servicios:', error.message);
        return await getMockData('servicios');
    }
}

// Obtener un servicio por ID
async function obtenerServicioPorId(id) {
    apiLogger.log('Obteniendo servicio por ID:', id);
    
    if (useMockData) {
        const servicios = await getMockData('servicios');
        return servicios.find(s => s.id == id || s.IDServicio == id) || null;
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/servicios/${id}`);
        if (!response.ok) throw new Error('Error al obtener servicio');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al obtener servicio:', error.message);
        const servicios = await getMockData('servicios');
        return servicios.find(s => s.id == id || s.IDServicio == id) || null;
    }
}

// Crear nuevo servicio
async function crearServicio(servicio) {
    apiLogger.log('Creando servicio:', servicio);
    
    if (useMockData) {
        return await createMockItem('servicios', servicio);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/servicios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servicio)
        });
        if (!response.ok) throw new Error('Error al crear servicio');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al crear servicio:', error.message);
        return await createMockItem('servicios', servicio);
    }
}

// Actualizar servicio
async function actualizarServicio(id, servicio) {
    apiLogger.log('Actualizando servicio:', id, servicio);
    
    if (useMockData) {
        return await updateMockItem('servicios', id, servicio);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/servicios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servicio)
        });
        if (!response.ok) throw new Error('Error al actualizar servicio');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al actualizar servicio:', error.message);
        return await updateMockItem('servicios', id, servicio);
    }
}

// Eliminar servicio
async function eliminarServicio(id) {
    apiLogger.log('Eliminando servicio:', id);
    
    if (useMockData) {
        return await deleteMockItem('servicios', id);
    }
    
    try {
        const response = await fetch(`${CONFIG?.API_URL || 'http://localhost:3000/api'}/servicios/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar servicio');
        return await response.json();
    } catch (error) {
        apiLogger.error('Error al eliminar servicio:', error.message);
        return await deleteMockItem('servicios', id);
    }
}
