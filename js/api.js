// ============================================
// CONFIGURACIÓN DE LA API
// ============================================
const API_URL = 'http://localhost:3000/api';

// ============================================
// FUNCIONES PARA HABITACIONES
// ============================================

// Obtener todas las habitaciones
async function obtenerHabitaciones() {
    try {
        const response = await fetch(`${API_URL}/habitaciones`);
        if (!response.ok) throw new Error('Error al obtener habitaciones');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener una habitación por ID
async function obtenerHabitacionPorId(id) {
    try {
        const response = await fetch(`${API_URL}/habitaciones/${id}`);
        if (!response.ok) throw new Error('Error al obtener habitación');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Crear nueva habitación
async function crearHabitacion(habitacion) {
    try {
        const response = await fetch(`${API_URL}/habitaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(habitacion)
        });
        if (!response.ok) throw new Error('Error al crear habitación');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Actualizar habitación
async function actualizarHabitacion(id, habitacion) {
    try {
        const response = await fetch(`${API_URL}/habitaciones/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(habitacion)
        });
        if (!response.ok) throw new Error('Error al actualizar habitación');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Eliminar habitación
async function eliminarHabitacion(id) {
    try {
        const response = await fetch(`${API_URL}/habitaciones/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar habitación');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ============================================
// FUNCIONES PARA CLIENTES
// ============================================

// Obtener todos los clientes
async function obtenerClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        if (!response.ok) throw new Error('Error al obtener clientes');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener un cliente por ID
async function obtenerClientePorId(id) {
    try {
        const response = await fetch(`${API_URL}/clientes/${id}`);
        if (!response.ok) throw new Error('Error al obtener cliente');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Crear nuevo cliente
async function crearCliente(cliente) {
    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });
        if (!response.ok) throw new Error('Error al crear cliente');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Actualizar cliente
async function actualizarCliente(id, cliente) {
    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });
        if (!response.ok) throw new Error('Error al actualizar cliente');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Eliminar cliente
async function eliminarCliente(id) {
    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar cliente');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ============================================
// FUNCIONES PARA RESERVAS
// ============================================

// Obtener todas las reservas
async function obtenerReservas() {
    try {
        const response = await fetch(`${API_URL}/reservas`);
        if (!response.ok) throw new Error('Error al obtener reservas');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener una reserva por ID
async function obtenerReservaPorId(id) {
    try {
        const response = await fetch(`${API_URL}/reservas/${id}`);
        if (!response.ok) throw new Error('Error al obtener reserva');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Crear nueva reserva
async function crearReserva(reserva) {
    try {
        const response = await fetch(`${API_URL}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reserva)
        });
        if (!response.ok) throw new Error('Error al crear reserva');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Actualizar reserva
async function actualizarReserva(id, reserva) {
    try {
        const response = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reserva)
        });
        if (!response.ok) throw new Error('Error al actualizar reserva');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Eliminar reserva
async function eliminarReserva(id) {
    try {
        const response = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar reserva');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ============================================
// FUNCIONES PARA SERVICIOS
// ============================================

// Obtener todos los servicios
async function obtenerServicios() {
    try {
        const response = await fetch(`${API_URL}/servicios`);
        if (!response.ok) throw new Error('Error al obtener servicios');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener un servicio por ID
async function obtenerServicioPorId(id) {
    try {
        const response = await fetch(`${API_URL}/servicios/${id}`);
        if (!response.ok) throw new Error('Error al obtener servicio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Crear nuevo servicio
async function crearServicio(servicio) {
    try {
        const response = await fetch(`${API_URL}/servicios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(servicio)
        });
        if (!response.ok) throw new Error('Error al crear servicio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Actualizar servicio
async function actualizarServicio(id, servicio) {
    try {
        const response = await fetch(`${API_URL}/servicios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(servicio)
        });
        if (!response.ok) throw new Error('Error al actualizar servicio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Eliminar servicio
async function eliminarServicio(id) {
    try {
        const response = await fetch(`${API_URL}/servicios/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar servicio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
