// ============================================
// DATOS MOCK - Para desarrollo sin backend
// ============================================

// Datos de ejemplo para habitaciones
const MOCK_HABITACIONES = [
    {
        IDHabitacion: 1,
        NombreHabitacion: 'Suite Presidencial',
        Descripcion: 'Habitación de lujo con vista al mar, jacuzzi y terraza privada',
        Costo: 350000,
        Estado: 'disponible',
        ImagenHabitacion: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
    },
    {
        IDHabitacion: 2,
        NombreHabitacion: 'Habitación Deluxe',
        Descripcion: 'Habitación espaciosa con cama king, minibar y vista a la ciudad',
        Costo: 200000,
        Estado: 'disponible',
        ImagenHabitacion: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
    },
    {
        IDHabitacion: 3,
        NombreHabitacion: 'Habitación Doble',
        Descripcion: 'Habitación cómoda con dos camas individuales, ideal para familias',
        Costo: 120000,
        Estado: 'ocupada',
        ImagenHabitacion: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
    },
    {
        IDHabitacion: 4,
        NombreHabitacion: 'Habitación Individual',
        Descripcion: 'Habitación económica con cama individual y baño privado',
        Costo: 80000,
        Estado: 'disponible',
        ImagenHabitacion: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
    },
    {
        IDHabitacion: 5,
        NombreHabitacion: 'Suite Familiar',
        Descripcion: 'Amplia suite con dos habitaciones, sala de estar y cocina',
        Costo: 280000,
        Estado: 'mantenimiento',
        ImagenHabitacion: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    }
];

// Datos de ejemplo para clientes
const MOCK_CLIENTES = [
    {
        IDCliente: 1,
        NombreCliente: 'Juan Carlos',
        EmailCliente: 'juan.carlos@email.com',
        TelefonoCliente: '3001234567',
        FechaRegistro: '2026-01-15'
    },
    {
        IDCliente: 2,
        NombreCliente: 'María García',
        EmailCliente: 'maria.garcia@email.com',
        TelefonoCliente: '3109876543',
        FechaRegistro: '2026-02-20'
    },
    {
        IDCliente: 3,
        NombreCliente: 'Carlos López',
        EmailCliente: 'carlos.lopez@email.com',
        TelefonoCliente: '3205551234',
        FechaRegistro: '2026-03-10'
    },
    {
        IDCliente: 4,
        NombreCliente: 'Ana Martínez',
        EmailCliente: 'ana.martinez@email.com',
        TelefonoCliente: '3156789012',
        FechaRegistro: '2026-03-25'
    }
];

// Datos de ejemplo para reservas
const MOCK_RESERVAS = [
    {
        IDReserva: 1,
        IDHabitacion: 1,
        IDCliente: 1,
        NombreCliente: 'Juan Carlos',
        EmailCliente: 'juan.carlos@email.com',
        TelefonoCliente: '3001234567',
        FechaEntrada: '2026-04-01',
        FechaSalida: '2026-04-05',
        NumeroAdultos: 2,
        NumeroNinos: 0,
        CostoTotal: 1400000,
        Estado: 'confirmada'
    },
    {
        IDReserva: 2,
        IDHabitacion: 2,
        IDCliente: 2,
        NombreCliente: 'María García',
        EmailCliente: 'maria.garcia@email.com',
        TelefonoCliente: '3109876543',
        FechaEntrada: '2026-04-10',
        FechaSalida: '2026-04-15',
        NumeroAdultos: 2,
        NumeroNinos: 1,
        CostoTotal: 1000000,
        Estado: 'pendiente'
    },
    {
        IDReserva: 3,
        IDHabitacion: 3,
        IDCliente: 3,
        NombreCliente: 'Carlos López',
        EmailCliente: 'carlos.lopez@email.com',
        TelefonoCliente: '3205551234',
        FechaEntrada: '2026-03-20',
        FechaSalida: '2026-03-25',
        NumeroAdultos: 1,
        NumeroNinos: 0,
        CostoTotal: 600000,
        Estado: 'completada'
    }
];

// Datos de ejemplo para servicios
const MOCK_SERVICIOS = [
    {
        IDServicio: 1,
        NombreServicio: 'Desayuno Buffet',
        Descripcion: 'Desayuno completo con variedad de opciones internacionales',
        Duracion: '2 horas',
        CantidadMaximaPersonas: 50,
        Costo: 25000,
        Estado: 'activo'
    },
    {
        IDServicio: 2,
        NombreServicio: 'Spa y Masajes',
        Descripcion: 'Tratamientos relajantes y terapéuticos',
        Duracion: '60 minutos',
        CantidadMaximaPersonas: 10,
        Costo: 80000,
        Estado: 'activo'
    },
    {
        IDServicio: 3,
        NombreServicio: 'Transporte Aeropuerto',
        Descripcion: 'Servicio de traslado privado al aeropuerto',
        Duracion: '45 minutos',
        CantidadMaximaPersonas: 4,
        Costo: 50000,
        Estado: 'activo'
    },
    {
        IDServicio: 4,
        NombreServicio: 'Piscina Climatizada',
        Descripcion: 'Acceso ilimitado a piscina y área recreativa',
        Duracion: 'Todo el día',
        CantidadMaximaPersonas: 30,
        Costo: 15000,
        Estado: 'activo'
    },
    {
        IDServicio: 5,
        NombreServicio: 'Gimnasio',
        Descripcion: 'Acceso a gimnasio equipado con entrenador personal',
        Duracion: '2 horas',
        CantidadMaximaPersonas: 15,
        Costo: 20000,
        Estado: 'inactivo'
    }
];

// Función para obtener datos mock según el tipo
// Estado mutable para simular persistencia de datos mock
let mockState = loadMockState();

function loadMockState() {
    try {
        const saved = localStorage.getItem('mockState');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Asegurar que todos los arrays existan
            return {
                habitaciones: parsed.habitaciones || [...MOCK_HABITACIONES],
                clientes: parsed.clientes || [...MOCK_CLIENTES],
                reservas: parsed.reservas || [...MOCK_RESERVAS],
                servicios: parsed.servicios || [...MOCK_SERVICIOS]
            };
        }
    } catch (e) {
        console.warn('Error loading mock state from localStorage:', e);
    }

    // Estado inicial
    return {
        habitaciones: [...MOCK_HABITACIONES],
        clientes: [...MOCK_CLIENTES],
        reservas: [...MOCK_RESERVAS],
        servicios: [...MOCK_SERVICIOS]
    };
}

function saveMockState() {
    try {
        localStorage.setItem('mockState', JSON.stringify(mockState));
    } catch (e) {
        console.warn('Error saving mock state to localStorage:', e);
    }
}

async function getMockData(tipo) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockState[tipo] || [];
}

// Función para crear un item mock
async function createMockItem(tipo, item) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (mockState[tipo]) {
        const newId = Math.max(...mockState[tipo].map(i => i[`ID${tipo.charAt(0).toUpperCase() + tipo.slice(1, -1)}`] || 0)) + 1;
        const newItem = { ...item, [`ID${tipo.charAt(0).toUpperCase() + tipo.slice(1, -1)}`]: newId };
        mockState[tipo].push(newItem);
        saveMockState(); // Guardar estado después de crear
        return newItem;
    }
    
    return item;
}

// Función para actualizar un item mock
async function updateMockItem(tipo, id, item) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (mockState[tipo]) {
        const index = mockState[tipo].findIndex(i => 
            i[`ID${tipo.charAt(0).toUpperCase() + tipo.slice(1, -1)}`] == id || i.id == id
        );
        if (index !== -1) {
            mockState[tipo][index] = { ...mockState[tipo][index], ...item };
            saveMockState(); // Guardar estado después de actualizar
            return mockState[tipo][index];
        }
    }
    
    return item;
}

// Función para eliminar un item mock
async function deleteMockItem(tipo, id) {
    await new Promise(resolve => setTimeout(resolve, 200));

    if (mockState[tipo]) {
        console.log(`Buscando ${tipo} con ID:`, id);
        console.log(`Array actual de ${tipo}:`, mockState[tipo]);

        const index = mockState[tipo].findIndex(i =>
            i[`ID${tipo.charAt(0).toUpperCase() + tipo.slice(1, -1)}`] == id || i.id == id
        );

        console.log(`Índice encontrado:`, index);

        if (index !== -1) {
            const itemEliminado = mockState[tipo].splice(index, 1);
            console.log(`Item eliminado:`, itemEliminado);
            console.log(`Array después de eliminar:`, mockState[tipo]);
            saveMockState(); // Guardar estado después de eliminar
            return { success: true };
        } else {
            console.log(`No se encontró el item con ID:`, id, '- podría ya estar eliminado');
            // Si no se encuentra, consideramos que ya fue eliminado (éxito)
            return { success: true, message: 'Item no encontrado, podría ya estar eliminado' };
        }
    }

    
    return { success: false, message: 'Tipo de dato no válido' };
}

// Función para restablecer el estado mock a los valores iniciales
function resetMockState() {
    mockState = {
        habitaciones: [...MOCK_HABITACIONES],
        clientes: [...MOCK_CLIENTES],
        reservas: [...MOCK_RESERVAS],
        servicios: [...MOCK_SERVICIOS]
    };
    saveMockState();
    console.log('Mock state restaurado a valores iniciales');
    return mockState;
}

// Exponer la función en window para poder usarla desde la UI
if (typeof window !== 'undefined') {
    window.resetMockState = resetMockState;
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MOCK_HABITACIONES,
        MOCK_CLIENTES,
        MOCK_RESERVAS,
        MOCK_SERVICIOS,
        getMockData,
        createMockItem,
        updateMockItem,
        deleteMockItem,
        resetMockState
    };
}
