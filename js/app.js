// ============================================
// FUNCIONES PARA MOSTRAR DATOS
// ============================================

let habitacionesAdminCargadas = [];
let habitacionAdminImagenArchivoBase64 = '';
let serviciosCargados = [];
let reservasCargadas = [];
let estadosReservaCargados = [];
let lastShownApiError = null;

const CLAVE_CONTRASTE_ALTO = 'hospedaje_alto_contraste';

const normalizarTexto = (valor) => String(valor ?? '').trim().toLowerCase();

const normalizarFecha = (valor) => {
    if (!valor) return '';

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
        return String(valor).slice(0, 10);
    }

    return fecha.toISOString().slice(0, 10);
};

const obtenerFiltrosReservas = () => {
    const documento = document.getElementById('documento-buscar-reservas');
    const estado = document.getElementById('estado-buscar-reservas');
    const fechaDesde = document.getElementById('fecha-desde-reservas');
    const fechaHasta = document.getElementById('fecha-hasta-reservas');

    return {
        documento: normalizarTexto(documento?.value),
        estado: String(estado?.value || ''),
        fechaDesde: fechaDesde?.value || '',
        fechaHasta: fechaHasta?.value || ''
    };
};

const obtenerNombreEstadoReserva = (reserva) => {
    return reserva.EstadoReservaNombre
        || reserva.NombreEstadoReserva
    || reserva.estadoNombre
        || 'Desconocido';
};

const obtenerClaseEstadoReserva = (nombreEstado) => {
    const normalizado = normalizarTexto(nombreEstado);

    if (normalizado.includes('pend')) return 'pendiente';
    if (normalizado.includes('conf')) return 'confirmada';
    if (normalizado.includes('cancel')) return 'cancelada';

    return normalizado.replace(/\s+/g, '-');
};

async function cargarEstadosReserva() {
    const select = document.getElementById('estado-buscar-reservas');
    if (!select) return;

    try {
        estadosReservaCargados = await obtenerEstadosReserva();
    } catch (error) {
        console.error('Error cargando estados de reserva:', error);
        estadosReservaCargados = [];
    }

    const estados = Array.isArray(estadosReservaCargados) && estadosReservaCargados.length > 0
        ? estadosReservaCargados
        : [];

    select.innerHTML = '<option value="">Todos los estados</option>';

    if (estados.length === 0) {
        console.warn('No se pudieron cargar estados de reserva desde la base de datos');
        return;
    }

    estados.forEach((estado) => {
        const option = document.createElement('option');
        option.value = String(estado.IdEstadoReserva);
        option.textContent = estado.NombreEstadoReserva;
        select.appendChild(option);
    });
}

const aplicarFiltrosReservas = (reservas) => {
    const filtros = obtenerFiltrosReservas();

    return (reservas || []).filter((reserva) => {
        const documentoReserva = normalizarTexto(reserva.NroDocumentoCliente || reserva.NroDocumento);
        const estadoReserva = String(Number(reserva.IdEstadoReserva || reserva.IdEstado || reserva.estadoId || ''));
        const fechaReserva = normalizarFecha(reserva.FechaInicio || reserva.FechaReserva || reserva.FechaFinalizacion);

        const coincideDocumento = !filtros.documento || documentoReserva.includes(filtros.documento);
        const coincideEstado = !filtros.estado || estadoReserva === filtros.estado;
        const coincideFechaDesde = !filtros.fechaDesde || (fechaReserva && fechaReserva >= filtros.fechaDesde);
        const coincideFechaHasta = !filtros.fechaHasta || (fechaReserva && fechaReserva <= filtros.fechaHasta);

        return coincideDocumento && coincideEstado && coincideFechaDesde && coincideFechaHasta;
    });
};

const notificarErrorBackend = (contexto) => {
    const apiError = typeof getApiLastError === 'function' ? getApiLastError() : null;

    if (!apiError) return;
    if (apiError === lastShownApiError) return;

    lastShownApiError = apiError;

    if (typeof showWarning === 'function') {
        showWarning(`${contexto}. Verifica que el backend esté activo en http://localhost:3000`, 'Conexión backend');
    }
};

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

        // Aceptar data URL (base64) para imágenes subidas desde el formulario CRUD
        if (valor.startsWith('data:image/')) {
            return valor;
        }
        
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
        const estadoInfo = normalizarEstadoHabitacion(habitacion.Estado);
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
                <span class="estado ${estadoInfo.clase}">${estadoInfo.texto}</span>
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

function mostrarReservas(reservas, mensajeVacio = 'No hay reservas registradas') {
    const contenedor = document.getElementById('reservas');
    if (!contenedor) return;
    
    console.log('Reservas recibidas:', reservas);
    contenedor.innerHTML = '';
    
    if (!reservas || reservas.length === 0) {
        contenedor.innerHTML = `<p class="mensaje-vacio">${mensajeVacio}</p>`;
        return;
    }
    
    reservas.forEach(reserva => {
        const reservaId = reserva.IdReserva || reserva.IDReserva || reserva.id;
        const estadoId = Number(reserva.IdEstadoReserva || reserva.IdEstado || reserva.estadoId || 1);
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
        const nombreEstado = obtenerNombreEstadoReserva(reserva);
        const claseEstado = obtenerClaseEstadoReserva(nombreEstado);

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
            <span class="estado ${claseEstado}">${nombreEstado}</span>
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
    notificarErrorBackend('No se pudieron cargar habitaciones');
    mostrarHabitaciones(habitaciones);
}

async function cargarClientes() {
    console.log('Cargando clientes...');
    const clientes = await obtenerClientes();
    console.log('Clientes obtenidos:', clientes);
    notificarErrorBackend('No se pudieron cargar clientes');
    mostrarClientes(clientes);
}

async function cargarReservas() {
    console.log('Cargando reservas...');
    reservasCargadas = await obtenerReservas();
    console.log('Reservas obtenidas:', reservasCargadas);
    notificarErrorBackend('No se pudieron cargar reservas');
    mostrarReservas(aplicarFiltrosReservas(reservasCargadas));
}

async function cargarReservasPorCliente(documento) {
    const termino = String(documento || '').trim();

    if (!termino) {
        await cargarReservas();
        return;
    }

    const documentoInput = document.getElementById('documento-buscar-reservas');
    if (documentoInput) {
        documentoInput.value = termino;
    }

    mostrarReservas(aplicarFiltrosReservas(reservasCargadas), 'No hay reservas que coincidan con los filtros');
}

function configurarBusquedaReservas() {
    const formulario = document.getElementById('form-buscar-reservas');
    const inputDocumento = document.getElementById('documento-buscar-reservas');
    const selectEstado = document.getElementById('estado-buscar-reservas');
    const inputFechaDesde = document.getElementById('fecha-desde-reservas');
    const inputFechaHasta = document.getElementById('fecha-hasta-reservas');
    const botonLimpiar = document.getElementById('limpiar-busqueda-reservas');

    if (!formulario || !inputDocumento) return;

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();
        mostrarReservas(aplicarFiltrosReservas(reservasCargadas), 'No hay reservas que coincidan con los filtros');
    });

    [inputDocumento, selectEstado, inputFechaDesde, inputFechaHasta].forEach((campo) => {
        if (campo) {
            campo.addEventListener('input', () => {
                mostrarReservas(aplicarFiltrosReservas(reservasCargadas), 'No hay reservas que coincidan con los filtros');
            });
            campo.addEventListener('change', () => {
                mostrarReservas(aplicarFiltrosReservas(reservasCargadas), 'No hay reservas que coincidan con los filtros');
            });
        }
    });

    if (botonLimpiar) {
        botonLimpiar.addEventListener('click', async (event) => {
            event.preventDefault();
            formulario.reset();
            await cargarReservas();
        });
    }
}

async function cargarServicios() {
    console.log('Cargando servicios...');
    const servicios = await obtenerServicios();
    console.log('Servicios obtenidos:', servicios);
    notificarErrorBackend('No se pudieron cargar servicios');
    mostrarServicios(servicios);
}

// ============================================
// CRUD DE HABITACIONES
// ============================================

const normalizarEstadoHabitacion = (estado) => {
    if (estado === 1 || estado === '1' || estado === true) {
        return { activo: true, texto: 'Disponible', clase: 'estado-disponible' };
    }

    if (typeof estado === 'string') {
        const valor = normalizarTexto(estado);
        if (['disponible', 'activo', 'activa', 'available', 'true', 'si', 'sí'].includes(valor)) {
            return { activo: true, texto: 'Disponible', clase: 'estado-disponible' };
        }
    }

    return { activo: false, texto: 'No disponible', clase: 'estado-no-disponible' };
};

const formatearCostoHabitacion = (valor) => {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return 'Sin costo';

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(numero);
};

const obtenerIdHabitacion = (habitacion) => habitacion?.IDHabitacion || habitacion?.id || habitacion?.IdHabitacion || '';

const escaparHtml = (valor) => String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const obtenerImagenParaPayload = (habitacion) => {
    const valor = habitacion?.ImagenHabitacion;

    if (typeof valor === 'string') {
        return valor;
    }

    if (valor && valor.type === 'Buffer' && Array.isArray(valor.data)) {
        try {
            let str = '';
            for (let i = 0; i < valor.data.length; i += 1) {
                str += String.fromCharCode(valor.data[i]);
            }
            return str || null;
        } catch (error) {
            console.warn('No se pudo convertir ImagenHabitacion Buffer a string:', error);
            return null;
        }
    }

    return null;
};

const mostrarMensajeHabitacionAdmin = (texto, tipo = 'info') => {
    const mensaje = document.getElementById('mensaje-habitacion-admin');
    if (!mensaje) return;

    mensaje.textContent = texto || '';
    mensaje.className = 'crud-habitaciones-mensaje';

    if (tipo === 'ok') {
        mensaje.classList.add('exito');
    } else if (tipo === 'error') {
        mensaje.classList.add('error');
    }
};

const mostrarPreviewHabitacionAdmin = (src) => {
    const wrap = document.getElementById('habitacion-admin-preview-wrap');
    const imagen = document.getElementById('habitacion-admin-preview');

    if (!wrap || !imagen) return;

    if (!src) {
        wrap.classList.add('hidden');
        imagen.removeAttribute('src');
        return;
    }

    imagen.src = src;
    wrap.classList.remove('hidden');
};

const leerArchivoComoDataUrl = (archivo) => {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(String(lector.result || ''));
        lector.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado'));
        lector.readAsDataURL(archivo);
    });
};

async function manejarArchivoHabitacionAdmin(event) {
    const archivo = event?.target?.files?.[0];

    if (!archivo) {
        habitacionAdminImagenArchivoBase64 = '';
        const imagenTexto = document.getElementById('habitacion-admin-imagen')?.value?.trim();
        if (imagenTexto) {
            mostrarPreviewHabitacionAdmin(obtenerUrlImagen(imagenTexto));
        } else {
            mostrarPreviewHabitacionAdmin('');
        }
        return;
    }

    const tamanoMaximo = 2 * 1024 * 1024;
    if (archivo.size > tamanoMaximo) {
        event.target.value = '';
        habitacionAdminImagenArchivoBase64 = '';
        mostrarPreviewHabitacionAdmin('');
        mostrarMensajeHabitacionAdmin('La imagen supera 2MB. Usa un archivo más liviano.', 'error');
        return;
    }

    try {
        const dataUrl = await leerArchivoComoDataUrl(archivo);
        habitacionAdminImagenArchivoBase64 = dataUrl;
        mostrarPreviewHabitacionAdmin(dataUrl);
        mostrarMensajeHabitacionAdmin('Imagen cargada correctamente. Se usará al guardar.', 'ok');
    } catch (error) {
        console.error(error);
        habitacionAdminImagenArchivoBase64 = '';
        mostrarPreviewHabitacionAdmin('');
        mostrarMensajeHabitacionAdmin('No se pudo procesar la imagen seleccionada.', 'error');
    }
}

const aplicarModoContraste = (activo) => {
    const body = document.body;
    const boton = document.getElementById('toggle-contraste');

    if (!body) return;

    body.classList.toggle('high-contrast', activo);

    if (boton) {
        boton.classList.toggle('activo', activo);
        boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
        boton.textContent = `Alto contraste: ${activo ? 'ON' : 'OFF'}`;
    }
};

function configurarModoContraste() {
    const boton = document.getElementById('toggle-contraste');
    const preferenciaGuardada = localStorage.getItem(CLAVE_CONTRASTE_ALTO) === 'true';

    aplicarModoContraste(preferenciaGuardada);

    if (!boton || boton.dataset.contrasteInicializado) {
        return;
    }

    boton.addEventListener('click', () => {
        const estaActivo = document.body.classList.contains('high-contrast');
        const nuevoEstado = !estaActivo;

        aplicarModoContraste(nuevoEstado);
        localStorage.setItem(CLAVE_CONTRASTE_ALTO, nuevoEstado ? 'true' : 'false');
    });

    boton.dataset.contrasteInicializado = 'true';
}

const actualizarResumenHabitacionesAdmin = (habitaciones) => {
    const total = document.getElementById('habitaciones-admin-total');
    const disponibles = document.getElementById('habitaciones-admin-disponibles');
    const noDisponibles = document.getElementById('habitaciones-admin-no-disponibles');

    const lista = Array.isArray(habitaciones) ? habitaciones : [];
    const totalHabitaciones = lista.length;
    const habitacionesDisponibles = lista.filter((habitacion) => normalizarEstadoHabitacion(habitacion.Estado).activo).length;
    const habitacionesNoDisponibles = totalHabitaciones - habitacionesDisponibles;

    if (total) total.textContent = totalHabitaciones;
    if (disponibles) disponibles.textContent = habitacionesDisponibles;
    if (noDisponibles) noDisponibles.textContent = habitacionesNoDisponibles;
};

const obtenerFiltrosHabitacionesAdmin = () => {
    const busqueda = document.getElementById('busqueda-habitaciones-admin');
    const filtroEstado = document.getElementById('filtro-estado-habitaciones-admin');

    return {
        termino: normalizarTexto(busqueda?.value),
        estado: filtroEstado?.value || 'all'
    };
};

const habitacionesAdminCoinciden = (habitacion, filtros) => {
    const textoBusqueda = [
        habitacion.NombreHabitacion,
        habitacion.Descripcion,
        habitacion.Estado,
        habitacion.Costo,
        obtenerIdHabitacion(habitacion)
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const coincideTexto = !filtros.termino || textoBusqueda.includes(filtros.termino);
    const estadoNormalizado = normalizarEstadoHabitacion(habitacion.Estado);

    if (filtros.estado === 'available' && !estadoNormalizado.activo) return false;
    if (filtros.estado === 'unavailable' && estadoNormalizado.activo) return false;

    return coincideTexto;
};

const renderizarHabitacionesAdmin = () => {
    const contenedor = document.getElementById('habitaciones-admin-tbody');
    if (!contenedor) return;

    const filtros = obtenerFiltrosHabitacionesAdmin();
    const habitacionesFiltradas = habitacionesAdminCargadas.filter((habitacion) => habitacionesAdminCoinciden(habitacion, filtros));

    actualizarResumenHabitacionesAdmin(habitacionesAdminCargadas);

    if (habitacionesFiltradas.length === 0) {
        contenedor.innerHTML = `
            <tr>
                <td colspan="6" class="mensaje-vacio">No hay habitaciones que coincidan con el filtro actual.</td>
            </tr>
        `;
        return;
    }

    contenedor.innerHTML = habitacionesFiltradas.map((habitacion) => {
        const idHabitacion = obtenerIdHabitacion(habitacion);
        const estado = normalizarEstadoHabitacion(habitacion.Estado);
        const imagenUrl = obtenerUrlImagen(habitacion.ImagenHabitacion);
        const switchId = `switch-habitacion-${idHabitacion}`;

        return `
            <tr>
                <td>
                    <div class="crud-habitaciones-imagen">
                        <img src="${imagenUrl}" alt="${escaparHtml(habitacion.NombreHabitacion || 'Habitación')}" onerror="this.src='assets/images/default.svg'">
                    </div>
                </td>
                <td>
                    <div class="crud-habitaciones-nombre">${escaparHtml(habitacion.NombreHabitacion || 'Sin nombre')}</div>
                    <div class="crud-habitaciones-descripcion">ID: ${escaparHtml(idHabitacion)}</div>
                </td>
                <td><strong>${formatearCostoHabitacion(habitacion.Costo)}</strong></td>
                <td>
                    <div class="crud-estado-control">
                        <label class="switch-estado" for="${escaparHtml(switchId)}">
                            <input
                                id="${escaparHtml(switchId)}"
                                type="checkbox"
                                data-accion-habitacion-estado="toggle"
                                data-id="${escaparHtml(idHabitacion)}"
                                ${estado.activo ? 'checked' : ''}
                                aria-label="Cambiar estado de ${escaparHtml(habitacion.NombreHabitacion || 'habitación')}"
                            >
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </td>
                <td class="crud-habitaciones-descripcion">${escaparHtml(habitacion.Descripcion || 'Sin descripción')}</td>
                <td>
                    <div class="crud-habitaciones-acciones">
                        <button type="button" class="btn-mini btn-mini-editar" data-accion-habitacion="editar" data-id="${escaparHtml(idHabitacion)}">Editar</button>
                        <button type="button" class="btn-mini btn-mini-eliminar" data-accion-habitacion="eliminar" data-id="${escaparHtml(idHabitacion)}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

async function cambiarEstadoHabitacionAdmin(id, nuevoEstado, inputToggle = null) {
    const habitacion = habitacionesAdminCargadas.find((item) => String(obtenerIdHabitacion(item)) === String(id));
    if (!habitacion) {
        if (inputToggle) {
            inputToggle.checked = !nuevoEstado;
            inputToggle.disabled = false;
        }
        mostrarMensajeHabitacionAdmin('No se encontró la habitación para cambiar estado.', 'error');
        return;
    }

    try {
        if (inputToggle) {
            inputToggle.disabled = true;
        }

        const payload = {
            NombreHabitacion: habitacion.NombreHabitacion,
            Descripcion: habitacion.Descripcion,
            Costo: Number(habitacion.Costo),
            Estado: nuevoEstado ? 1 : 0,
            ImagenHabitacion: obtenerImagenParaPayload(habitacion)
        };

        const resultado = await actualizarHabitacion(id, payload);
        if (!resultado) {
            throw new Error('No se pudo actualizar el estado de la habitación');
        }

        habitacion.Estado = nuevoEstado ? 1 : 0;
        renderizarHabitacionesAdmin();
        mostrarMensajeHabitacionAdmin(`Estado actualizado: ${habitacion.NombreHabitacion} ${nuevoEstado ? 'habilitada' : 'inhabilitada'}.`, 'ok');

        if (typeof cargarHabitaciones === 'function') {
            await cargarHabitaciones();
        }
    } catch (error) {
        console.error('Error al cambiar estado de habitación:', error);
        if (inputToggle) {
            inputToggle.checked = !nuevoEstado;
        }
        mostrarMensajeHabitacionAdmin(error.message || 'No se pudo actualizar el estado', 'error');
    } finally {
        if (inputToggle) {
            inputToggle.disabled = false;
        }
    }
}

const limpiarFormularioHabitacionAdmin = (mostrarMensaje = true) => {
    const formulario = document.getElementById('form-habitacion-admin');
    const campoId = document.getElementById('habitacion-admin-id');
    const campoNombre = document.getElementById('habitacion-admin-nombre');
    const campoDescripcion = document.getElementById('habitacion-admin-descripcion');
    const campoCosto = document.getElementById('habitacion-admin-costo');
    const campoEstado = document.getElementById('habitacion-admin-estado');
    const campoImagen = document.getElementById('habitacion-admin-imagen');
    const campoImagenArchivo = document.getElementById('habitacion-admin-imagen-archivo');
    const titulo = document.getElementById('habitacion-admin-form-title');
    const botonGuardar = document.getElementById('btn-habitacion-admin-guardar');

    if (formulario) formulario.reset();
    if (campoId) campoId.value = '';
    if (campoNombre) campoNombre.value = '';
    if (campoDescripcion) campoDescripcion.value = '';
    if (campoCosto) campoCosto.value = '';
    if (campoEstado) campoEstado.value = '1';
    if (campoImagen) campoImagen.value = '';
    if (campoImagenArchivo) campoImagenArchivo.value = '';
    if (titulo) titulo.textContent = 'Crear habitación';
    if (botonGuardar) botonGuardar.textContent = 'Guardar habitación';
    habitacionAdminImagenArchivoBase64 = '';
    mostrarPreviewHabitacionAdmin('');

    if (mostrarMensaje) {
        mostrarMensajeHabitacionAdmin('Formulario listo para crear una nueva habitación.');
    }
};

const cargarHabitacionEnFormularioAdmin = (habitacion) => {
    const campoId = document.getElementById('habitacion-admin-id');
    const campoNombre = document.getElementById('habitacion-admin-nombre');
    const campoDescripcion = document.getElementById('habitacion-admin-descripcion');
    const campoCosto = document.getElementById('habitacion-admin-costo');
    const campoEstado = document.getElementById('habitacion-admin-estado');
    const campoImagen = document.getElementById('habitacion-admin-imagen');
    const campoImagenArchivo = document.getElementById('habitacion-admin-imagen-archivo');
    const titulo = document.getElementById('habitacion-admin-form-title');
    const botonGuardar = document.getElementById('btn-habitacion-admin-guardar');
    const formulario = document.getElementById('form-habitacion-admin');

    if (!habitacion) return;

    if (campoId) campoId.value = obtenerIdHabitacion(habitacion);
    if (campoNombre) campoNombre.value = habitacion.NombreHabitacion || '';
    if (campoDescripcion) campoDescripcion.value = habitacion.Descripcion || '';
    if (campoCosto) campoCosto.value = habitacion.Costo ?? '';
    if (campoEstado) campoEstado.value = normalizarEstadoHabitacion(habitacion.Estado).activo ? '1' : '0';
    if (campoImagen) campoImagen.value = typeof habitacion.ImagenHabitacion === 'string' ? habitacion.ImagenHabitacion : '';
    if (campoImagenArchivo) campoImagenArchivo.value = '';
    habitacionAdminImagenArchivoBase64 = '';
    mostrarPreviewHabitacionAdmin(campoImagen?.value ? obtenerUrlImagen(campoImagen.value) : '');
    if (titulo) titulo.textContent = `Editar habitación #${obtenerIdHabitacion(habitacion)}`;
    if (botonGuardar) botonGuardar.textContent = 'Actualizar habitación';

    mostrarMensajeHabitacionAdmin(`Editando ${habitacion.NombreHabitacion || 'la habitación seleccionada'}.`, 'ok');

    if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

async function cargarHabitacionesAdmin() {
    const contenedor = document.getElementById('habitaciones-admin-tbody');
    if (!contenedor) return;

    try {
        mostrarMensajeHabitacionAdmin('Cargando habitaciones...');
        habitacionesAdminCargadas = await obtenerHabitaciones();
        renderizarHabitacionesAdmin();
        mostrarMensajeHabitacionAdmin(`Se cargaron ${habitacionesAdminCargadas.length} habitaciones.`, 'ok');
    } catch (error) {
        console.error('Error al cargar habitaciones para el CRUD:', error);
        habitacionesAdminCargadas = [];
        contenedor.innerHTML = `
            <tr>
                <td colspan="6" class="mensaje-vacio">Error al cargar habitaciones</td>
            </tr>
        `;
        mostrarMensajeHabitacionAdmin('No se pudieron cargar las habitaciones.', 'error');
    }
}

async function guardarHabitacionAdmin(event) {
    event.preventDefault();

    const campoId = document.getElementById('habitacion-admin-id');
    const campoNombre = document.getElementById('habitacion-admin-nombre');
    const campoDescripcion = document.getElementById('habitacion-admin-descripcion');
    const campoCosto = document.getElementById('habitacion-admin-costo');
    const campoEstado = document.getElementById('habitacion-admin-estado');
    const campoImagen = document.getElementById('habitacion-admin-imagen');
    const botonGuardar = document.getElementById('btn-habitacion-admin-guardar');

    const idHabitacion = campoId?.value?.trim();
    const nombreHabitacion = campoNombre?.value?.trim();
    const descripcion = campoDescripcion?.value?.trim();
    const costo = campoCosto?.value;
    const estado = campoEstado?.value ?? '1';
    const imagenHabitacion = campoImagen?.value?.trim();
    const imagenFinal = habitacionAdminImagenArchivoBase64 || imagenHabitacion || null;

    if (!nombreHabitacion || !descripcion || !costo) {
        mostrarMensajeHabitacionAdmin('Nombre, descripción y costo son obligatorios.', 'error');
        return;
    }

    try {
        if (botonGuardar) botonGuardar.disabled = true;
        mostrarMensajeHabitacionAdmin(idHabitacion ? 'Actualizando habitación...' : 'Creando habitación...');

        const payload = {
            NombreHabitacion: nombreHabitacion,
            Descripcion: descripcion,
            Costo: Number(costo),
            Estado: Number(estado),
            ImagenHabitacion: imagenFinal
        };

        const resultado = idHabitacion
            ? await actualizarHabitacion(idHabitacion, payload)
            : await crearHabitacion(payload);

        if (!resultado) {
            throw new Error('No se pudo guardar la habitación');
        }

        limpiarFormularioHabitacionAdmin(false);
        await cargarHabitacionesAdmin();
        mostrarMensajeHabitacionAdmin(idHabitacion ? 'Habitación actualizada correctamente.' : 'Habitación creada correctamente.', 'ok');

        if (typeof cargarHabitaciones === 'function') {
            await cargarHabitaciones();
        }
    } catch (error) {
        console.error('Error al guardar habitación:', error);
        mostrarMensajeHabitacionAdmin(error.message || 'Error al guardar la habitación', 'error');
    } finally {
        if (botonGuardar) botonGuardar.disabled = false;
    }
}

async function eliminarHabitacionAdmin(id) {
    const habitacion = habitacionesAdminCargadas.find((item) => String(obtenerIdHabitacion(item)) === String(id));
    const nombre = habitacion?.NombreHabitacion || `ID ${id}`;

    if (!confirm(`¿Seguro que deseas eliminar la habitación ${nombre}?`)) {
        return;
    }

    try {
        mostrarMensajeHabitacionAdmin(`Eliminando ${nombre}...`);
        const resultado = await eliminarHabitacion(id);

        if (!resultado) {
            throw new Error('No se pudo eliminar la habitación');
        }

        await cargarHabitacionesAdmin();
        mostrarMensajeHabitacionAdmin('Habitación eliminada correctamente.', 'ok');

        if (typeof cargarHabitaciones === 'function') {
            await cargarHabitaciones();
        }
    } catch (error) {
        console.error('Error al eliminar habitación:', error);
        mostrarMensajeHabitacionAdmin(error.message || 'Error al eliminar la habitación', 'error');
    }
}

function configurarCRUDHabitaciones() {
    const formulario = document.getElementById('form-habitacion-admin');
    const botonLimpiar = document.getElementById('btn-habitacion-admin-limpiar');
    const botonRecargar = document.getElementById('btn-habitaciones-admin-recargar');
    const buscador = document.getElementById('busqueda-habitaciones-admin');
    const filtroEstado = document.getElementById('filtro-estado-habitaciones-admin');
    const inputImagenTexto = document.getElementById('habitacion-admin-imagen');
    const inputImagenArchivo = document.getElementById('habitacion-admin-imagen-archivo');
    const tabla = document.getElementById('habitaciones-admin-tbody');

    if (formulario && !formulario.dataset.crudHabitacionesInicializado) {
        formulario.addEventListener('submit', guardarHabitacionAdmin);
        formulario.dataset.crudHabitacionesInicializado = 'true';
    }

    if (botonLimpiar && !botonLimpiar.dataset.crudHabitacionesInicializado) {
        botonLimpiar.addEventListener('click', limpiarFormularioHabitacionAdmin);
        botonLimpiar.dataset.crudHabitacionesInicializado = 'true';
    }

    if (botonRecargar && !botonRecargar.dataset.crudHabitacionesInicializado) {
        botonRecargar.addEventListener('click', cargarHabitacionesAdmin);
        botonRecargar.dataset.crudHabitacionesInicializado = 'true';
    }

    if (buscador && !buscador.dataset.crudHabitacionesInicializado) {
        buscador.addEventListener('input', renderizarHabitacionesAdmin);
        buscador.dataset.crudHabitacionesInicializado = 'true';
    }

    if (filtroEstado && !filtroEstado.dataset.crudHabitacionesInicializado) {
        filtroEstado.addEventListener('change', renderizarHabitacionesAdmin);
        filtroEstado.dataset.crudHabitacionesInicializado = 'true';
    }

    if (inputImagenTexto && !inputImagenTexto.dataset.crudHabitacionesInicializado) {
        inputImagenTexto.addEventListener('input', () => {
            if (habitacionAdminImagenArchivoBase64) return;
            const valor = inputImagenTexto.value.trim();
            mostrarPreviewHabitacionAdmin(valor ? obtenerUrlImagen(valor) : '');
        });
        inputImagenTexto.dataset.crudHabitacionesInicializado = 'true';
    }

    if (inputImagenArchivo && !inputImagenArchivo.dataset.crudHabitacionesInicializado) {
        inputImagenArchivo.addEventListener('change', manejarArchivoHabitacionAdmin);
        inputImagenArchivo.dataset.crudHabitacionesInicializado = 'true';
    }

    if (tabla && !tabla.dataset.crudHabitacionesInicializado) {
        tabla.addEventListener('click', (event) => {
            const boton = event.target.closest('button[data-accion-habitacion]');
            if (!boton) return;

            const accion = boton.dataset.accionHabitacion;
            const id = boton.dataset.id;

            if (accion === 'editar') {
                const habitacion = habitacionesAdminCargadas.find((item) => String(obtenerIdHabitacion(item)) === String(id));
                if (habitacion) {
                    cargarHabitacionEnFormularioAdmin(habitacion);
                }
                return;
            }

            if (accion === 'eliminar') {
                eliminarHabitacionAdmin(id);
            }
        });

        tabla.addEventListener('change', (event) => {
            const switchEstado = event.target.closest('input[data-accion-habitacion-estado="toggle"]');
            if (!switchEstado) return;

            const id = switchEstado.dataset.id;
            const nuevoEstado = switchEstado.checked;
            cambiarEstadoHabitacionAdmin(id, nuevoEstado, switchEstado);
        });

        tabla.dataset.crudHabitacionesInicializado = 'true';
    }
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
// FUNCIONES DE NAVEGACIÓN ENTRE SECCIONES
// ============================================

function cargarSeccion(seccion, event) {
    if (event) {
        event.preventDefault();
    }

    // Ocultar todas las secciones
    document.querySelectorAll('[id^="seccion-"]').forEach((section) => {
        section.classList.add('hidden');
    });

    // Mostrar la sección seleccionada
    const idSeccion = `seccion-${seccion}`;
    const elementoSeccion = document.getElementById(idSeccion);
    
    if (elementoSeccion) {
        elementoSeccion.classList.remove('hidden');
        
        // Cargar datos según la sección
        if (seccion === 'habitaciones') {
            cargarHabitaciones();
        } else if (seccion === 'administrar-habitaciones') {
            cargarHabitacionesAdmin();
        } else if (seccion === 'clientes') {
            cargarClientes();
        } else if (seccion === 'reservas') {
            cargarReservas();
        } else if (seccion === 'servicios') {
            cargarServicios();
        } else if (seccion === 'administrar-servicios') {
            cargarServiciosAdmin();
        }
        
        // Cerrar sidebar en móviles
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    }
}

// ============================================
// FUNCIONES CRUD SERVICIOS
// ============================================

const normalizarEstadoServicio = (estado) => {
    const activo = Number(estado) === 1;
    return {
        activo,
        clase: activo ? 'activo' : 'inactivo',
        texto: activo ? 'Activo' : 'Inactivo'
    };
};

const obtenerIdServicio = (servicio) => servicio.IDServicio;

const formatearCostoServicio = (costo) => {
    const numero = Number(costo);
    return Number.isNaN(numero) ? '$0' : `$${numero.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const mostrarMensajeServicioAdmin = (mensaje, tipo = 'info') => {
    const elemento = document.getElementById('mensaje-servicio-admin');
    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.className = 'crud-servicios-mensaje';
    if (tipo !== 'info') {
        elemento.classList.add(tipo);
    }

    if (tipo === 'error' || tipo === 'ok') {
        setTimeout(() => {
            elemento.textContent = '';
            elemento.className = 'crud-servicios-mensaje';
        }, 3500);
    }
};

async function cargarServiciosAdmin() {
    try {
        serviciosCargados = await obtenerServicios();
        renderizarServiciosAdmin();
    } catch (error) {
        console.error('Error cargando servicios:', error);
        serviciosCargados = [];
        mostrarMensajeServicioAdmin('Error al cargar servicios del servidor', 'error');
    }
}

const obtenerFiltrosServiciosAdmin = () => {
    const busqueda = document.getElementById('busqueda-servicios-admin');
    const filtroEstado = document.getElementById('filtro-estado-servicios-admin');

    return {
        termino: normalizarTexto(busqueda?.value),
        estado: filtroEstado?.value || 'all'
    };
};

const serviciosAdminCoinciden = (servicio, filtros) => {
    const textoBusqueda = [
        servicio.NombreServicio,
        servicio.Descripcion,
        servicio.Estado,
        servicio.Costo,
        obtenerIdServicio(servicio)
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const coincideTexto = !filtros.termino || textoBusqueda.includes(filtros.termino);
    const estadoNormalizado = normalizarEstadoServicio(servicio.Estado);

    if (filtros.estado === 'active' && !estadoNormalizado.activo) return false;
    if (filtros.estado === 'inactive' && estadoNormalizado.activo) return false;

    return coincideTexto;
};

const actualizarResumenServiciosAdmin = (servicios) => {
    const total = document.getElementById('servicios-admin-total');
    const activos = document.getElementById('servicios-admin-activos');
    const inactivos = document.getElementById('servicios-admin-inactivos');

    const lista = Array.isArray(servicios) ? servicios : [];
    const totalServicios = lista.length;
    const serviciosActivos = lista.filter((servicio) => normalizarEstadoServicio(servicio.Estado).activo).length;
    const serviciosInactivos = totalServicios - serviciosActivos;

    if (total) total.textContent = totalServicios;
    if (activos) activos.textContent = serviciosActivos;
    if (inactivos) inactivos.textContent = serviciosInactivos;
};

const renderizarServiciosAdmin = () => {
    const contenedor = document.getElementById('servicios-admin-tbody');
    if (!contenedor) return;

    const filtros = obtenerFiltrosServiciosAdmin();
    const serviciosFiltrados = serviciosCargados.filter((servicio) => serviciosAdminCoinciden(servicio, filtros));

    actualizarResumenServiciosAdmin(serviciosCargados);

    if (serviciosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <tr>
                <td colspan="7" class="mensaje-vacio">No hay servicios que coincidan con el filtro actual.</td>
            </tr>
        `;
        return;
    }

    contenedor.innerHTML = serviciosFiltrados.map((servicio) => {
        const idServicio = obtenerIdServicio(servicio);
        const estado = normalizarEstadoServicio(servicio.Estado);
        const switchId = `switch-servicio-${idServicio}`;

        return `
            <tr>
                <td>
                    <div class="crud-servicios-nombre">${escaparHtml(servicio.NombreServicio || 'Sin nombre')}</div>
                    <div class="crud-servicios-descripcion">ID: ${escaparHtml(idServicio)}</div>
                </td>
                <td><strong>${servicio.Duracion || '—'}</strong></td>
                <td>${servicio.CantidadMaximaPersonas || '—'}</td>
                <td><strong>${formatearCostoServicio(servicio.Costo)}</strong></td>
                <td>
                    <div class="crud-estado-control">
                        <label class="switch-estado-servicio" for="${escaparHtml(switchId)}">
                            <input
                                id="${escaparHtml(switchId)}"
                                type="checkbox"
                                data-accion-servicio-estado="toggle"
                                data-id="${escaparHtml(idServicio)}"
                                ${estado.activo ? 'checked' : ''}
                                aria-label="Cambiar estado de ${escaparHtml(servicio.NombreServicio || 'servicio')}"
                            >
                            <span class="switch-slider-servicio"></span>
                        </label>
                    </div>
                </td>
                <td class="crud-servicios-descripcion">${escaparHtml(servicio.Descripcion || 'Sin descripción')}</td>
                <td>
                    <div class="crud-servicios-acciones">
                        <button type="button" class="btn-mini btn-mini-editar" data-accion-servicio="editar" data-id="${escaparHtml(idServicio)}">Editar</button>
                        <button type="button" class="btn-mini btn-mini-eliminar" data-accion-servicio="eliminar" data-id="${escaparHtml(idServicio)}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

async function cambiarEstadoServicioAdmin(id, nuevoEstado, inputToggle = null) {
    const servicio = serviciosCargados.find((item) => String(obtenerIdServicio(item)) === String(id));
    if (!servicio) {
        if (inputToggle) {
            inputToggle.checked = !nuevoEstado;
            inputToggle.disabled = false;
        }
        mostrarMensajeServicioAdmin('No se encontró el servicio para cambiar estado.', 'error');
        return;
    }

    try {
        if (inputToggle) {
            inputToggle.disabled = true;
        }

        const payload = {
            NombreServicio: servicio.NombreServicio,
            Descripcion: servicio.Descripcion,
            Duracion: servicio.Duracion,
            CantidadMaximaPersonas: servicio.CantidadMaximaPersonas,
            Costo: Number(servicio.Costo),
            Estado: nuevoEstado ? 1 : 0
        };

        const resultado = await actualizarServicio(id, payload);
        if (!resultado) {
            throw new Error('No se pudo actualizar el estado del servicio');
        }

        servicio.Estado = nuevoEstado ? 1 : 0;
        renderizarServiciosAdmin();
        mostrarMensajeServicioAdmin(`Estado actualizado: ${servicio.NombreServicio} ${nuevoEstado ? 'activado' : 'desactivado'}.`, 'ok');
    } catch (error) {
        console.error('Error al cambiar estado de servicio:', error);
        if (inputToggle) {
            inputToggle.checked = !nuevoEstado;
        }
        mostrarMensajeServicioAdmin(error.message || 'No se pudo actualizar el estado', 'error');
    } finally {
        if (inputToggle) {
            inputToggle.disabled = false;
        }
    }
}

const limpiarFormularioServicioAdmin = (mostrarMensaje = true) => {
    const formulario = document.getElementById('form-servicio-admin');
    const campoId = document.getElementById('servicio-admin-id');
    const campoNombre = document.getElementById('servicio-admin-nombre');
    const campoDescripcion = document.getElementById('servicio-admin-descripcion');
    const campoDuracion = document.getElementById('servicio-admin-duracion');
    const campoCantidadMaxima = document.getElementById('servicio-admin-cantidad-maxima');
    const campoCosto = document.getElementById('servicio-admin-costo');
    const campoEstado = document.getElementById('servicio-admin-estado');
    const titulo = document.getElementById('servicio-admin-form-title');
    const botonGuardar = document.getElementById('btn-servicio-admin-guardar');

    if (formulario) formulario.reset();
    if (campoId) campoId.value = '';
    if (campoNombre) campoNombre.value = '';
    if (campoDescripcion) campoDescripcion.value = '';
    if (campoDuracion) campoDuracion.value = '';
    if (campoCantidadMaxima) campoCantidadMaxima.value = '';
    if (campoCosto) campoCosto.value = '';
    if (campoEstado) campoEstado.value = '1';
    if (titulo) titulo.textContent = 'Crear servicio';
    if (botonGuardar) botonGuardar.textContent = 'Guardar servicio';

    if (mostrarMensaje) {
        mostrarMensajeServicioAdmin('Formulario listo para crear un nuevo servicio.');
    }
};

const cargarServicioEnFormularioAdmin = (servicio) => {
    const campoId = document.getElementById('servicio-admin-id');
    const campoNombre = document.getElementById('servicio-admin-nombre');
    const campoDescripcion = document.getElementById('servicio-admin-descripcion');
    const campoDuracion = document.getElementById('servicio-admin-duracion');
    const campoCantidadMaxima = document.getElementById('servicio-admin-cantidad-maxima');
    const campoCosto = document.getElementById('servicio-admin-costo');
    const campoEstado = document.getElementById('servicio-admin-estado');
    const titulo = document.getElementById('servicio-admin-form-title');
    const botonGuardar = document.getElementById('btn-servicio-admin-guardar');

    if (!servicio) return;

    const idServicio = obtenerIdServicio(servicio);

    if (campoId) campoId.value = idServicio;
    if (campoNombre) campoNombre.value = servicio.NombreServicio || '';
    if (campoDescripcion) campoDescripcion.value = servicio.Descripcion || '';
    if (campoDuracion) campoDuracion.value = servicio.Duracion || '';
    if (campoCantidadMaxima) campoCantidadMaxima.value = servicio.CantidadMaximaPersonas || '';
    if (campoCosto) campoCosto.value = servicio.Costo || '';
    if (campoEstado) campoEstado.value = servicio.Estado;
    if (titulo) titulo.textContent = `Editar: ${servicio.NombreServicio}`;
    if (botonGuardar) botonGuardar.textContent = 'Actualizar servicio';

    mostrarMensajeServicioAdmin('Servicio cargado en el formulario. Modifica los campos y guarda los cambios.');
};

async function guardarServicioAdmin(evento) {
    evento.preventDefault();

    const campoId = document.getElementById('servicio-admin-id');
    const campoNombre = document.getElementById('servicio-admin-nombre');
    const campoDescripcion = document.getElementById('servicio-admin-descripcion');
    const campoDuracion = document.getElementById('servicio-admin-duracion');
    const campoCantidadMaxima = document.getElementById('servicio-admin-cantidad-maxima');
    const campoCosto = document.getElementById('servicio-admin-costo');
    const campoEstado = document.getElementById('servicio-admin-estado');

    const id = campoId?.value;
    const nombre = campoNombre?.value.trim();
    const descripcion = campoDescripcion?.value.trim();
    const duracion = campoDuracion?.value.trim();
    const cantidadMaxima = campoCantidadMaxima?.value.trim();
    const costo = campoCosto?.value.trim();
    const estado = campoEstado?.value;

    if (!nombre || !descripcion || !duracion || !cantidadMaxima || !costo || estado === undefined) {
        mostrarMensajeServicioAdmin('Por favor completa todos los campos del formulario.', 'error');
        return;
    }

    const payload = {
        NombreServicio: nombre,
        Descripcion: descripcion,
        Duracion: Number(duracion),
        CantidadMaximaPersonas: Number(cantidadMaxima),
        Costo: Number(costo),
        Estado: Number(estado)
    };

    try {
        if (id) {
            // Actualizar
            const resultado = await actualizarServicio(id, payload);
            if (!resultado) {
                throw new Error('No se pudo actualizar el servicio');
            }
            mostrarMensajeServicioAdmin(`Servicio "${nombre}" actualizado correctamente.`, 'ok');
        } else {
            // Crear
            const resultado = await crearServicio(payload);
            if (!resultado) {
                throw new Error('No se pudo crear el servicio');
            }
            mostrarMensajeServicioAdmin(`Servicio "${nombre}" creado correctamente.`, 'ok');
        }

        limpiarFormularioServicioAdmin(false);
        await cargarServiciosAdmin();
    } catch (error) {
        console.error('Error al guardar servicio:', error);
        mostrarMensajeServicioAdmin(error.message || 'No se pudo guardar el servicio', 'error');
    }
}

async function eliminarServicioAdmin(id) {
    const servicio = serviciosCargados.find((item) => String(obtenerIdServicio(item)) === String(id));
    if (!servicio) {
        mostrarMensajeServicioAdmin('Servicio no encontrado.', 'error');
        return;
    }

    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar el servicio "${servicio.NombreServicio}"?`);
    if (!confirmacion) return;

    try {
        const resultado = await eliminarServicio(id);
        if (!resultado) {
            throw new Error('No se pudo eliminar el servicio');
        }

        mostrarMensajeServicioAdmin(`Servicio "${servicio.NombreServicio}" eliminado correctamente.`, 'ok');
        limpiarFormularioServicioAdmin(false);
        await cargarServiciosAdmin();
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        mostrarMensajeServicioAdmin(error.message || 'No se pudo eliminar el servicio', 'error');
    }
}

const inicializarFormularioServiciosAdmin = () => {
    const formulario = document.getElementById('form-servicio-admin');
    const botonLimpiar = document.getElementById('btn-servicio-admin-limpiar');
    const botonRecargar = document.getElementById('btn-servicios-admin-recargar');
    const buscador = document.getElementById('busqueda-servicios-admin');
    const filtroEstado = document.getElementById('filtro-estado-servicios-admin');
    const tabla = document.getElementById('servicios-admin-tbody')?.closest('table');

    if (formulario && !formulario.dataset.serviciosAdminInicializado) {
        formulario.addEventListener('submit', guardarServicioAdmin);
        formulario.dataset.serviciosAdminInicializado = 'true';
    }

    if (botonLimpiar && !botonLimpiar.dataset.serviciosAdminInicializado) {
        botonLimpiar.addEventListener('click', () => limpiarFormularioServicioAdmin());
        botonLimpiar.dataset.serviciosAdminInicializado = 'true';
    }

    if (botonRecargar && !botonRecargar.dataset.serviciosAdminInicializado) {
        botonRecargar.addEventListener('click', cargarServiciosAdmin);
        botonRecargar.dataset.serviciosAdminInicializado = 'true';
    }

    if (buscador && !buscador.dataset.serviciosAdminInicializado) {
        buscador.addEventListener('input', renderizarServiciosAdmin);
        buscador.dataset.serviciosAdminInicializado = 'true';
    }

    if (filtroEstado && !filtroEstado.dataset.serviciosAdminInicializado) {
        filtroEstado.addEventListener('change', renderizarServiciosAdmin);
        filtroEstado.dataset.serviciosAdminInicializado = 'true';
    }

    if (tabla && !tabla.dataset.serviciosAdminInicializado) {
        tabla.addEventListener('click', (event) => {
            const boton = event.target.closest('button[data-accion-servicio]');
            if (!boton) return;

            const accion = boton.dataset.accionServicio;
            const id = boton.dataset.id;

            if (accion === 'editar') {
                const servicio = serviciosCargados.find((item) => String(obtenerIdServicio(item)) === String(id));
                if (servicio) {
                    cargarServicioEnFormularioAdmin(servicio);
                }
                return;
            }

            if (accion === 'eliminar') {
                eliminarServicioAdmin(id);
            }
        });

        tabla.addEventListener('change', (event) => {
            const switchEstado = event.target.closest('input[data-accion-servicio-estado="toggle"]');
            if (!switchEstado) return;

            const id = switchEstado.dataset.id;
            const nuevoEstado = switchEstado.checked;
            cambiarEstadoServicioAdmin(id, nuevoEstado, switchEstado);
        });

        tabla.dataset.serviciosAdminInicializado = 'true';
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada, conectando con backend...');
    console.log('Backend URL:', 'http://localhost:3000/api');
    configurarModoContraste();
    
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
    
    // Inicializar CRUD de habitaciones y servicios
    if (document.getElementById('form-habitacion-admin')) {
        inicializarFormularioHabitacionesAdmin();
    }
    
    if (document.getElementById('form-servicio-admin')) {
        inicializarFormularioServiciosAdmin();
    }
    
    if (document.getElementById('servicios')) {
        cargarServicios();
    }

    if (document.getElementById('habitaciones-admin-tbody')) {
        configurarCRUDHabitaciones();
        cargarHabitacionesAdmin();
    }
    
    // Configurar formulario de registro de clientes
    configurarFormularioRegistroCliente();
    
    // Configurar formulario de editar cliente (si existe)
    if (typeof configurarFormularioEditarCliente === 'function') {
        configurarFormularioEditarCliente();
    }

    configurarBusquedaReservas();

    if (document.getElementById('estado-buscar-reservas')) {
        cargarEstadosReserva();
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
window.cargarHabitacionesAdmin = cargarHabitacionesAdmin;
window.guardarHabitacionAdmin = guardarHabitacionAdmin;
window.eliminarHabitacionAdmin = eliminarHabitacionAdmin;
window.limpiarFormularioHabitacionAdmin = limpiarFormularioHabitacionAdmin;
