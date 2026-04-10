// ============================================
// EVENTOS Y FORMULARIOS
// ============================================

// Búsqueda de habitaciones
function buscarHabitaciones(termino) {
    obtenerHabitaciones().then(habitaciones => {
        const filtradas = habitaciones.filter(h => 
            h.NombreHabitacion.toLowerCase().includes(termino.toLowerCase()) ||
            h.Descripcion.toLowerCase().includes(termino.toLowerCase())
        );
        mostrarHabitaciones(filtradas);
    });
}

// Filtrar por estado
function filtrarPorEstado(estado) {
    obtenerHabitaciones().then(habitaciones => {
        const filtradas = estado === 'todas' 
            ? habitaciones 
            : habitaciones.filter(h => h.Estado.toLowerCase() === estado.toLowerCase());
        mostrarHabitaciones(filtradas);
    });
}

// Ordenar por precio
function ordenarPorPrecio(orden) {
    obtenerHabitaciones().then(habitaciones => {
        const ordenadas = [...habitaciones].sort((a, b) => {
            return orden === 'asc' 
                ? a.Costo - b.Costo 
                : b.Costo - a.Costo;
        });
        mostrarHabitaciones(ordenadas);
    });
}

// ============================================
// EVENTOS DE FORMULARIOS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Formulario de búsqueda
    const formBusqueda = document.getElementById('form-busqueda');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', (e) => {
            e.preventDefault();
            const termino = document.getElementById('busqueda').value;
            buscarHabitaciones(termino);
        });
    }
    
    // Filtro por estado
    const selectEstado = document.getElementById('filtro-estado');
    if (selectEstado) {
        selectEstado.addEventListener('change', (e) => {
            filtrarPorEstado(e.target.value);
        });
    }
    
    // Ordenar por precio
    const selectOrden = document.getElementById('orden-precio');
    if (selectOrden) {
        selectOrden.addEventListener('change', (e) => {
            ordenarPorPrecio(e.target.value);
        });
    }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Limpiar filtros
function limpiarFiltros() {
    const busqueda = document.getElementById('busqueda');
    const filtroEstado = document.getElementById('filtro-estado');
    const ordenPrecio = document.getElementById('orden-precio');
    
    if (busqueda) busqueda.value = '';
    if (filtroEstado) filtroEstado.value = 'todas';
    if (ordenPrecio) ordenPrecio.value = '';
    
    cargarHabitaciones();
}

