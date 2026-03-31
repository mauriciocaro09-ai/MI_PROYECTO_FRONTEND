// ============================================
// FUNCIONES PARA MOSTRAR DATOS
// ============================================

// Variable para controlar el carrusel
let carruselIndex = 0;
let habitacionesCargadas = [];

// Función para validar y obtener URL de imagen
function obtenerUrlImagen(valor) {
    // Imagen por defecto
    const imagenDefault = 'assets/images/default.svg';
    
    // Si no hay valor, retornar imagen por defecto
    if (!valor) return imagenDefault;
    
    // Si es un objeto con tipo Buffer (MySQL Node.js driver)
    if (valor.type === 'Buffer' && valor.data) {
        // Convertir el array de bytes a string manualmente
        let str = '';
        for (let i = 0; i < valor.data.length; i++) {
            str += String.fromCharCode(valor.data[i]);
        }
        valor = str;
    }
    
    // Si ya es un string
    if (typeof valor === 'string') {
        // Validar que sea una URL válida o ruta válida
        if (valor.trim() === '') return imagenDefault;
        
        // Verificar si es una URL válida
        if (valor.startsWith('http://') || valor.startsWith('https://')) {
            try {
                new URL(valor);
                return valor;
            } catch (e) {
                console.warn('URL de imagen inválida:', valor);
                return imagenDefault;
            }
        }
        
        // Verificar si es una ruta relativa válida
        if (valor.startsWith('/') || valor.startsWith('./') || valor.startsWith('../')) {
            return valor;
        }
        
        // Verificar extensiones de imagen comunes
        const extensionesImagen = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        const tieneExtensionImagen = extensionesImagen.some(ext => 
            valor.toLowerCase().endsWith(ext)
        );
        
        if (tieneExtensionImagen) {
            return valor;
        }
        
        // Si no cumple ningún criterio, usar imagen por defecto
        console.warn('Formato de imagen no reconocido:', valor);
        return imagenDefault;
    }
    
    // Si es cualquier otro tipo, intentar convertir a string
    try {
        const str = String(valor);
        if (str.trim() === '' || str === 'null' || str === 'undefined') {
            return imagenDefault;
        }
        return str;
    } catch (e) {
        return imagenDefault;
    }
}

// Función para precargar imagen y verificar que existe
function precargarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve('assets/images/default.svg');
        img.src = url;
    });
}

// Función para obtener imagen con fallback
async function obtenerImagenConFallback(valor) {
    const url = obtenerUrlImagen(valor);
    
    // Si es la imagen por defecto, retornar directamente
    if (url === 'assets/images/default.svg') {
        return url;
    }
    
    // Precargar imagen para verificar que existe
    return await precargarImagen(url);
}

function mostrarHabitacionesSidebar(habitaciones) {
    const gridContenedor = document.getElementById('habitaciones-gallery-grid');
    const carouselTrack = document.getElementById('carousel-track');
    
    if (!gridContenedor && !carouselTrack) return;
    
    console.log('Cargando miniaturas en sidebar:', habitaciones);
    
    if (!habitaciones || habitaciones.length === 0) {
        if (gridContenedor) {
            gridContenedor.innerHTML = '<p class="mensaje-vacio">No hay habitaciones disponibles</p>';
        }
        return;
    }
    
    // Guardar habitaciones para el carrusel
    habitacionesCargadas = habitaciones;
    
    // Renderizar Grid
    if (gridContenedor) {
        gridContenedor.innerHTML = '';
        
        habitaciones.forEach(habitacion => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => verDetalles(habitacion.IDHabitacion || habitacion.id);
            
            // Usar la función para obtener la URL correcta
            const imagen = obtenerUrlImagen(habitacion.ImagenHabitacion);
            
            item.innerHTML = `
                <img src="${imagen}" alt="${habitacion.NombreHabitacion}" 
                     onerror="this.src='assets/images/default.svg'">
                <div class="gallery-item-info">
                    <h4>${habitacion.NombreHabitacion}</h4>
                    <p class="precio">$${habitacion.Costo}/noche</p>
                </div>
            `;
            gridContenedor.appendChild(item);
        });
    }
    
        // Renderizar Carrusel
    if (carouselTrack) {
        carouselTrack.innerHTML = '';
        
        habitaciones.forEach(habitacion => {
            const slide = document.createElement('li');
            slide.className = 'carousel-slide';
            
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => verDetalles(habitacion.IDHabitacion || habitacion.id);
            
            // Usar la función para obtener la URL correcta
            const imagen = obtenerUrlImagen(habitacion.ImagenHabitacion);
            
            item.innerHTML = `
                <img src="${imagen}" alt="${habitacion.NombreHabitacion}" 
                     onerror="this.src='assets/images/default.svg'">
                <div class="gallery-item-info">
                    <h4>${habitacion.NombreHabitacion}</h4>
                    <p class="precio">$${habitacion.Costo}/noche</p>
                </div>
            `;
            
            slide.appendChild(item);
            carouselTrack.appendChild(slide);
        });
        
        // Reiniciar índice del carrusel
        carruselIndex = 0;
    }
}

// Función para cambiar entre vista grid y carrusel
function cambiarVista(vista) {
    const gridViewBtn = document.getElementById('gallery-grid-view');
    const carouselViewBtn = document.getElementById('gallery-carousel-view');
    const gridContenedor = document.getElementById('habitaciones-gallery-grid');
    const carouselContenedor = document.getElementById('habitaciones-gallery-carousel');
    
    if (vista === 'grid') {
        gridViewBtn.classList.add('active');
        carouselViewBtn.classList.remove('active');
        gridContenedor.style.display = 'grid';
        carouselContenedor.style.display = 'none';
    } else {
        gridViewBtn.classList.remove('active');
        carouselViewBtn.classList.add('active');
        gridContenedor.style.display = 'none';
        carouselContenedor.style.display = 'flex';
    }
}

// Función para mover el carrusel
function moverCarrusel(direccion) {
    const track = document.getElementById('carousel-track');
    if (!track || habitacionesCargadas.length === 0) return;
    
    carruselIndex += direccion;
    
    // Ciclar el índice
    if (carruselIndex < 0) {
        carruselIndex = habitacionesCargadas.length - 1;
    } else if (carruselIndex >= habitacionesCargadas.length) {
        carruselIndex = 0;
    }
    
    // Mover el track
    track.style.transform = `translateX(-${carruselIndex * 100}%)`;
}

// Función para cargar habitaciones en el sidebar
async function cargarHabitacionesSidebar() {
    console.log('Cargando miniaturas para sidebar...');
    try {
        const habitaciones = await obtenerHabitaciones();
        console.log('Miniaturas obtenidas:', habitaciones);
        mostrarHabitacionesSidebar(habitaciones);
    } catch (error) {
        console.error('Error al cargar miniaturas:', error);
        const gridContenedor = document.getElementById('habitaciones-gallery-grid');
        if (gridContenedor) {
            gridContenedor.innerHTML = '<p class="mensaje-vacio">Error al cargar</p>';
        }
    }
}

// Función para mostrar clientes en el sidebar
function mostrarClientesSidebar(clientes) {
    const gridContenedor = document.getElementById('clientes-gallery-grid');
    if (!gridContenedor) return;
    
    console.log('Cargando clientes en sidebar:', clientes);
    
    if (!clientes || clientes.length === 0) {
        gridContenedor.innerHTML = '<p class="mensaje-vacio">No hay clientes registrados</p>';
        return;
    }
    
    gridContenedor.innerHTML = '';
    
    clientes.forEach(cliente => {
        const item = document.createElement('div');
        item.className = 'cliente-item';
        
        // Determinar el nombre a mostrar
        const nombre = cliente.Nombre || cliente.NombreCliente || cliente.nombre || 'Sin nombre';
        const email = cliente.Email || cliente.EmailCliente || cliente.email || 'Sin email';
        
        item.innerHTML = `
            <div class="cliente-item-info">
                <h4>${nombre}</h4>
                <p>${email}</p>
            </div>
        `;
        gridContenedor.appendChild(item);
    });
}

// Función para cargar clientes en el sidebar
async function cargarClientesSidebar() {
    console.log('Cargando clientes para sidebar...');
    try {
        const clientes = await obtenerClientes();
        console.log('Clientes obtenidos:', clientes);
        mostrarClientesSidebar(clientes);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        const gridContenedor = document.getElementById('clientes-gallery-grid');
        if (gridContenedor) {
            gridContenedor.innerHTML = '<p class="mensaje-vacio">Error al cargar</p>';
        }
    }
}

// Función para registrar un nuevo cliente
async function registrarCliente(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('cliente-nombre').value;
    const email = document.getElementById('cliente-email').value;
    const telefono = document.getElementById('cliente-telefono').value;
    const direccion = document.getElementById('cliente-direccion').value;
    
    const mensajeDiv = document.getElementById('mensaje-registro-cliente');
    
    try {
        const response = await fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                NroDocumento: 'TEMP-' + Date.now(),
                Nombre: nombre,
                Email: email,
                Telefono: telefono,
                Direccion: direccion,
                Estado: 1,
                IDRol: 1
            })
        });
        
        if (response.ok) {
            mensajeDiv.textContent = 'Cliente registrado exitosamente';
            mensajeDiv.className = 'mensaje-registro exito';
            
            // Limpiar formulario
            document.getElementById('form-registro-cliente').reset();
            
            // Recargar lista de clientes
            cargarClientesSidebar();
            
            // Ocultar mensaje después de 3 segundos
            setTimeout(() => {
                mensajeDiv.textContent = '';
                mensajeDiv.className = 'mensaje-registro';
            }, 3000);
        } else {
            throw new Error('Error al registrar cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeDiv.textContent = 'Error al registrar cliente';
        mensajeDiv.className = 'mensaje-registro error';
    }
}

// Configurar formulario de registro de clientes
function configurarFormularioRegistroCliente() {
    const formulario = document.getElementById('form-registro-cliente');
    if (formulario) {
        formulario.addEventListener('submit', registrarCliente);
    }
}

function mostrarHabitaciones(habitaciones) {
    const contenedor = document.getElementById('habitaciones');
    if (!contenedor) return;
    
    console.log('Habitaciones recibidas:', habitaciones);
    contenedor.innerHTML = '';
    
    if (!habitaciones || habitaciones.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay habitaciones disponibles</p>';
        return;
    }
    
    habitaciones.forEach(habitacion => {
        const card = document.createElement('div');
        card.className = 'habitacion-card';
        // Usar la función para obtener la URL correcta
        const imagenUrl = obtenerUrlImagen(habitacion.ImagenHabitacion);
        card.innerHTML = `
            <div class="habitacion-imagen">
                <img src="${imagenUrl}" 
                     alt="${habitacion.NombreHabitacion}"
                     onerror="this.src='assets/images/default.svg'">
            </div>
            <div class="habitacion-info">
                <h3>${habitacion.NombreHabitacion}</h3>
                <p class="descripcion">${habitacion.Descripcion || 'Sin descripción'}</p>
                <p class="precio">$${habitacion.Costo} / noche</p>
                <span class="estado ${String(habitacion.Estado || 'disponible').toLowerCase()}">${habitacion.Estado || 'disponible'}</span>
                <button onclick="verDetalles(${habitacion.IDHabitacion})" class="btn-ver">Ver Detalles</button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function mostrarClientes(clientes) {
    const contenedor = document.getElementById('clientes');
    if (!contenedor) return;
    
    console.log('Clientes recibidos:', clientes);
    contenedor.innerHTML = '';
    
    if (!clientes || clientes.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay clientes registrados</p>';
        return;
    }
    
    clientes.forEach(cliente => {
        const card = document.createElement('div');
        card.className = 'cliente-card';       
        card.innerHTML = `
            <h3>${cliente.Nombre || cliente.NombreCliente || 'Cliente'}</h3>
            <p><strong>Email:</strong> ${cliente.Email || cliente.EmailCliente || 'Sin email'}</p>
            <p><strong>Teléfono:</strong> ${cliente.Telefono || cliente.TelefonoCliente || 'Sin teléfono'}</p>
            <p><strong>Documento:</strong> ${cliente.NroDocumento || cliente.IDCliente || 'Sin documento'}</p>
        `;
        contenedor.appendChild(card);
    });
}

function mostrarReservas(reservas) {
    const contenedor = document.getElementById('reservas');
    if (!contenedor) return;
    
    console.log('Reservas recibidas:', reservas);
    contenedor.innerHTML = '';
    
    if (!reservas || reservas.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay reservas registradas</p>';
        return;
    }
    
    reservas.forEach(reserva => {
        const reservaId = reserva.IdReserva || reserva.IDReserva || reserva.id;
        const estadoId = reserva.IdEstadoReserva || reserva.IdEstado || reserva.estadoId || 1;
        const nombreCliente = reserva.Nombre || reserva.NombreCliente || 'Sin nombre';
        const apellidoCliente = reserva.Apellido || reserva.ApellidoCliente || '';
        const documentoCliente = reserva.NroDocumentoCliente || reserva.NroDocumento || '';
        const emailCliente = reserva.Email || reserva.EmailCliente || 'Sin email';
        const habitacionId = reserva.IDHabitacion || reserva.idHabitacion || 'N/A';
        const fechaInicio = reserva.FechaInicio || reserva.FechaEntrada || 'N/A';
        const fechaFinalizacion = reserva.FechaFinalizacion || reserva.FechaSalida || 'N/A';
        const subTotal = reserva.Sub_Total || reserva.CostoTotal || 0;
        const iva = reserva.IVA || 0;
        const total = reserva.Monto_Total || reserva.CostoTotal || 0;

        const card = document.createElement('div');
        card.className = 'reserva-card';
        card.innerHTML = `
            <h3>Reserva #${reservaId}</h3>
            <p><strong>Cliente:</strong> ${nombreCliente} ${apellidoCliente} (${documentoCliente})</p>
            <p><strong>Email:</strong> ${emailCliente}</p>
            <p><strong>Habitación:</strong> ${habitacionId}</p>
            <p><strong>Entrada:</strong> ${new Date(fechaInicio).toLocaleDateString()}</p>
            <p><strong>Salida:</strong> ${new Date(fechaFinalizacion).toLocaleDateString()}</p>
            <p><strong>Subtotal:</strong> $${subTotal}</p>
            <p><strong>IVA:</strong> $${iva}</p>
            <p><strong>Total:</strong> $${total}</p>
            <span class="estado ${estadoId === 1 ? 'pendiente' : estadoId === 2 ? 'confirmada' : 'cancelada'}">${estadoId === 1 ? 'Pendiente' : estadoId === 2 ? 'Confirmada' : 'Cancelada'}</span>
            <div class="reserva-acciones">
                <button class="btn-eliminar" onclick="eliminarReservaUI(${reservaId})">Eliminar</button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function mostrarServicios(servicios) {
    const contenedor = document.getElementById('servicios');
    if (!contenedor) return;
    
    console.log('Servicios recibidos:', servicios);
    contenedor.innerHTML = '';
    
    if (!servicios || servicios.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay servicios disponibles</p>';
        return;
    }
    
    servicios.forEach(servicio => {
        const card = document.createElement('div');
        card.className = 'servicio-card';
        card.innerHTML = `
            <h3>${servicio.NombreServicio}</h3>
            <p>${servicio.Descripcion || 'Sin descripción'}</p>
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
    
    // Cargar miniaturas en el sidebar
    if (document.getElementById('habitaciones-gallery-grid')) {
        cargarHabitacionesSidebar();
        
        // Configurar botones de cambio de vista
        const gridViewBtn = document.getElementById('gallery-grid-view');
        const carouselViewBtn = document.getElementById('gallery-carousel-view');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => cambiarVista('grid'));
        }
        
        if (carouselViewBtn) {
            carouselViewBtn.addEventListener('click', () => cambiarVista('carousel'));
        }
    }
    
    // Cargar clientes en el sidebar
    if (document.getElementById('clientes-gallery-grid')) {
        cargarClientesSidebar();
    }
    
    // Configurar formulario de registro de clientes
    configurarFormularioRegistroCliente();
    
    // Configurar formulario de editar cliente (si existe)
    if (typeof configurarFormularioEditarCliente === 'function') {
        configurarFormularioEditarCliente();
    }
});

// ============================================
// FUNCIONES EDITAR/ELIMINAR CLIENTES
// ============================================

// Variable para almacenar el ID del cliente que se está editando
let clienteEditandoId = null;

// Función para abrir el modal de edición de cliente
function abrirModalEditarCliente(cliente) {
    clienteEditandoId = cliente.IDCliente;
    
    // Llenar el formulario con los datos del cliente
    document.getElementById('edit-cliente-id').value = cliente.IDCliente;
    document.getElementById('edit-cliente-nombre').value = cliente.NombreCliente || '';
    document.getElementById('edit-cliente-email').value = cliente.EmailCliente || '';
    document.getElementById('edit-cliente-telefono').value = cliente.TelefonoCliente || '';
    
    // Mostrar el modal
    document.getElementById('modal-editar-cliente').style.display = 'flex';
}

// Función para cerrar el modal de edición
function cerrarModalEditarCliente() {
    document.getElementById('modal-editar-cliente').style.display = 'none';
    clienteEditandoId = null;
}

// Función para guardar los cambios del cliente editado
async function guardarClienteEditado(e) {
    e.preventDefault();
    
    // Obtener los valores del formulario
    const id = document.getElementById('edit-cliente-id').value;
    const nombre = document.getElementById('edit-cliente-nombre').value;
    const email = document.getElementById('edit-cliente-email').value;
    const telefono = document.getElementById('edit-cliente-telefono').value;
    const mensajeDiv = document.getElementById('mensaje-editar-cliente');
    
    // Validar campos requeridos
    if (!nombre || !email) {
        mensajeDiv.textContent = 'Por favor completa los campos requeridos';
        mensajeDiv.className = 'mensaje-editar error';
        return;
    }
    
    try {
        // Actualizar el cliente
        const res = await actualizarCliente(id, {
            NombreCliente: nombre,
            EmailCliente: email,
            TelefonoCliente: telefono
        });
        
        if (res) {
            // Mostrar mensaje de éxito
            mensajeDiv.textContent = 'Cliente actualizado exitosamente';
            mensajeDiv.className = 'mensaje-editar exito';
            
            // Cerrar modal y recargar datos después de 1.5 segundos
            setTimeout(() => {
                cerrarModalEditarCliente();
                mensajeDiv.textContent = '';
                mensajeDiv.className = 'mensaje-editar';
                cargarClientes();
                cargarClientesSidebar();
            }, 1500);
        } else {
            throw new Error('No se pudo actualizar el cliente');
        }
    } catch (err) {
        console.error('Error al actualizar cliente:', err);
        mensajeDiv.textContent = 'Error al actualizar cliente';
        mensajeDiv.className = 'mensaje-editar error';
    }
}

// Función para eliminar un cliente
async function eliminarClienteUI(id) {
    // Confirmar antes de eliminar
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) {
        return;
    }
    
    try {
        const res = await eliminarCliente(id);
        
        if (res) {
            alert('Cliente eliminado exitosamente');
            cargarClientes();
            cargarClientesSidebar();
        } else {
            throw new Error('No se pudo eliminar el cliente');
        }
    } catch (err) {
        console.error('Error al eliminar cliente:', err);
        alert('Error al eliminar el cliente');
    }
}

// Función para eliminar una reserva
async function eliminarReservaUI(id) {
    // Confirmar antes de eliminar
    if (!confirm('¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        console.log('Eliminando reserva con ID:', id);
        const res = await eliminarReserva(id);
        console.log('Resultado de eliminarReserva:', res);

        // Verificar si la eliminación fue exitosa
        // Para datos mock: { success: true }
        // Para API real: cualquier respuesta sin error
        if (res && (res.success === true || res.success !== false)) {
            alert('Reserva eliminada exitosamente');
            console.log('Recargando reservas...');
            await cargarReservas();
            console.log('Reservas recargadas');
        } else {
            console.error('Respuesta inesperada:', res);
            throw new Error('La eliminación no se completó correctamente');
        }
    } catch (err) {
        console.error('Error al eliminar reserva:', err);
        alert('Error al eliminar la reserva: ' + err.message);
    }
}

// ============================================
// FUNCIONES GLOBALES PARA EVENTOS ONCLICK
// ============================================

// Hacer funciones disponibles globalmente para los eventos onclick
window.eliminarClienteUI = eliminarClienteUI;
window.eliminarReservaUI = eliminarReservaUI;
