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
    
    // Formulario de reserva
    const formReserva = document.getElementById('form-reserva');
    if (formReserva) {
        formReserva.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const reserva = {
                cliente_id: parseInt(document.getElementById('cliente_id').value),
                habitacion_id: parseInt(document.getElementById('habitacion_id').value),
                fecha_entrada: document.getElementById('fecha_entrada').value,
                fecha_salida: document.getElementById('fecha_salida').value,
                estado: 'confirmada'
            };
            
            console.log('Creando reserva:', reserva);
            const resultado = await crearReserva(reserva);
            
            if (resultado) {
                alert('¡Reserva creada exitosamente!');
                formReserva.reset();
                // Recargar reservas si existe el contenedor
                if (document.getElementById('reservas')) {
                    cargarReservas();
                }
            } else {
                alert('Error al crear la reserva. Verifica los datos.');
            }
        });
    }
    
    // Formulario de cliente
    const formCliente = document.getElementById('form-cliente');
    if (formCliente) {
        formCliente.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const cliente = {
                Nombre: document.getElementById('nombre').value,
                Apellido: document.getElementById('apellido').value,
                CorreoElectronico: document.getElementById('email').value,
                Telefono: document.getElementById('telefono').value,
                Direccion: document.getElementById('direccion').value,
                NumeroDocumento: document.getElementById('numero_documento').value,
                TipoDocumento: document.getElementById('tipo_documento').value
            };
            
            console.log('Creando cliente:', cliente);
            const resultado = await crearCliente(cliente);
            
            if (resultado) {
                alert('¡Cliente registrado exitosamente!');
                formCliente.reset();
                // Recargar clientes si existe el contenedor
                if (document.getElementById('clientes')) {
                    cargarClientes();
                }
            } else {
                alert('Error al registrar el cliente. Verifica los datos.');
            }
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

// Validar fechas de reserva
function validarFechasReserva(fechaEntrada, fechaSalida) {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (entrada < hoy) {
        alert('La fecha de entrada no puede ser anterior a hoy');
        return false;
    }
    
    if (salida <= entrada) {
        alert('La fecha de salida debe ser posterior a la fecha de entrada');
        return false;
    }
    
    return true;
}
