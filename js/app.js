// ============================================
// FUNCIONES PARA MOSTRAR DATOS
// ============================================

function mostrarHabitaciones(habitaciones) {
    const contenedor = document.getElementById('habitaciones');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (habitaciones.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay habitaciones disponibles</p>';
        return;
    }
    
    habitaciones.forEach(habitacion => {
        const card = document.createElement('div');
        card.className = 'habitacion-card';
        card.innerHTML = `
            <div class="habitacion-imagen">
                <img src="${habitacion.ImagenHabitacion || 'assets/images/default.jpg'}" 
                     alt="${habitacion.NombreHabitacion}"
                     onerror="this.src='assets/images/default.jpg'">
            </div>
            <div class="habitacion-info">
                <h3>${habitacion.NombreHabitacion}</h3>
                <p class="descripcion">${habitacion.Descripcion}</p>
                <p class="precio">$${habitacion.Costo} / noche</p>
                <span class="estado ${habitacion.Estado.toLowerCase()}">${habitacion.Estado}</span>
                <button onclick="verDetalles(${habitacion.id})" class="btn-ver">Ver Detalles</button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function mostrarClientes(clientes) {
    const contenedor = document.getElementById('clientes');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (clientes.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay clientes registrados</p>';
        return;
    }
    
    clientes.forEach(cliente => {
        const card = document.createElement('div');
        card.className = 'cliente-card';
        card.innerHTML = `
            <h3>${cliente.Nombre} ${cliente.Apellido}</h3>
            <p><strong>Email:</strong> ${cliente.CorreoElectronico}</p>
            <p><strong>Teléfono:</strong> ${cliente.Telefono}</p>
            <p><strong>Documento:</strong> ${cliente.TipoDocumento} ${cliente.NumeroDocumento}</p>
        `;
        contenedor.appendChild(card);
    });
}

function mostrarReservas(reservas) {
    const contenedor = document.getElementById('reservas');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (reservas.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay reservas registradas</p>';
        return;
    }
    
    reservas.forEach(reserva => {
        const card = document.createElement('div');
        card.className = 'reserva-card';
        card.innerHTML = `
            <h3>Reserva #${reserva.id}</h3>
            <p><strong>Cliente ID:</strong> ${reserva.cliente_id}</p>
            <p><strong>Habitación ID:</strong> ${reserva.habitacion_id}</p>
            <p><strong>Entrada:</strong> ${new Date(reserva.fecha_entrada).toLocaleDateString()}</p>
            <p><strong>Salida:</strong> ${new Date(reserva.fecha_salida).toLocaleDateString()}</p>
            <span class="estado ${reserva.estado}">${reserva.estado}</span>
        `;
        contenedor.appendChild(card);
    });
}

function mostrarServicios(servicios) {
    const contenedor = document.getElementById('servicios');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (servicios.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay servicios disponibles</p>';
        return;
    }
    
    servicios.forEach(servicio => {
        const card = document.createElement('div');
        card.className = 'servicio-card';
        card.innerHTML = `
            <h3>${servicio.NombreServicio}</h3>
            <p>${servicio.Descripcion}</p>
            <p class="precio">$${servicio.Costo}</p>
        `;
        contenedor.appendChild(card);
    });
}

// ============================================
// FUNCIONES DE CARGA
// ============================================

async function cargarHabitaciones() {
    console.log('Cargando habitaciones...');
    const habitaciones = await obtenerHabitaciones();
    console.log('Habitaciones obtenidas:', habitaciones);
    mostrarHabitaciones(habitaciones);
}

async function cargarClientes() {
    console.log('Cargando clientes...');
    const clientes = await obtenerClientes();
    console.log('Clientes obtenidos:', clientes);
    mostrarClientes(clientes);
}

async function cargarReservas() {
    console.log('Cargando reservas...');
    const reservas = await obtenerReservas();
    console.log('Reservas obtenidas:', reservas);
    mostrarReservas(reservas);
}

async function cargarServicios() {
    console.log('Cargando servicios...');
    const servicios = await obtenerServicios();
    console.log('Servicios obtenidos:', servicios);
    mostrarServicios(servicios);
}

// ============================================
// FUNCIONES DE INTERACCIÓN
// ============================================

function verDetalles(id) {
    console.log('Ver detalles de habitación:', id);
    // Aquí puedes redirigir a una página de detalles
    // window.location.href = `pages/detalle.html?id=${id}`;
    alert(`Ver detalles de habitación ID: ${id}`);
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada, conectando con backend...');
    console.log('Backend URL:', 'http://localhost:3000/api');
    
    // Cargar datos según la página actual
    if (document.getElementById('habitaciones')) {
        cargarHabitaciones();
    }
    
    if (document.getElementById('clientes')) {
        cargarClientes();
    }
    
    if (document.getElementById('reservas')) {
        cargarReservas();
    }
    
    if (document.getElementById('servicios')) {
        cargarServicios();
    }
});
