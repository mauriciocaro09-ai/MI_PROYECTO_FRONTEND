// ============================================
// FUNCIONES PARA MOSTRAR DATOS
// ============================================

let habitacionesAdminCargadas = [];
let serviciosCargados = [];
let lastShownApiError = null;

const paginationState = {
    habitaciones: { page: 1, pageSize: 6 },
    servicios: { page: 1, pageSize: 6 },
    habitacionesAdmin: { page: 1, pageSize: 6 },
    serviciosAdmin: { page: 1, pageSize: 8 }
};

const CLAVE_CONTRASTE_ALTO = 'hospedaje_alto_contraste';

const ensurePaginationState = (key) => {
    if (!paginationState[key]) {
        paginationState[key] = { page: 1, pageSize: 8 };
    }

    return paginationState[key];
};

const resetPagination = (key) => {
    ensurePaginationState(key).page = 1;
};

const getPaginatedItems = (items, key) => {
    const state = ensurePaginationState(key);
    const list = Array.isArray(items) ? items : [];
    const totalItems = list.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));

    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    const startIndex = (state.page - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;

    return {
        items: list.slice(startIndex, endIndex),
        totalItems,
        totalPages,
        currentPage: state.page
    };
};

const renderPaginationControls = (key, anchorElement, totalItems, totalPages, currentPage, onPageChange) => {
    if (!anchorElement) return;

    const containerId = `pagination-${key}`;
    let controls = document.getElementById(containerId);

    if (!controls) {
        controls = document.createElement('div');
        controls.id = containerId;
        controls.className = 'pagination-controls';
        anchorElement.insertAdjacentElement('afterend', controls);
    }

    if (totalItems === 0 || totalPages <= 1) {
        controls.innerHTML = '';
        controls.classList.add('hidden');
        return;
    }

    controls.classList.remove('hidden');
    controls.innerHTML = `
        <button type="button" class="pagination-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
        <span class="pagination-info">Página ${currentPage} de ${totalPages} (${totalItems} registros)</span>
        <button type="button" class="pagination-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
    `;

    controls.querySelectorAll('.pagination-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const nextPage = Number(button.dataset.page);
            const state = ensurePaginationState(key);
            state.page = Math.min(Math.max(1, nextPage), totalPages);
            onPageChange();
        });
    });
};

const normalizarTexto = (valor) => String(valor ?? '').trim().toLowerCase();

const normalizarFecha = (valor) => {
    if (!valor) return '';

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
        return String(valor).slice(0, 10);
    }

    return fecha.toISOString().slice(0, 10);
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



function mostrarHabitaciones(habitaciones) {
    const contenedor = document.getElementById('habitaciones');
    if (!contenedor) return;
    
    console.log('Habitaciones recibidas:', habitaciones);
    contenedor.innerHTML = '';

    const lista = Array.isArray(habitaciones) ? habitaciones : [];
    const paginacion = getPaginatedItems(lista, 'habitaciones');
    const habitacionesVisibles = paginacion.items;

    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay habitaciones disponibles</p>';
        renderPaginationControls('habitaciones', contenedor, 0, 0, 1, () => mostrarHabitaciones(lista));
        return;
    }

    habitacionesVisibles.forEach(habitacion => {
        const card = document.createElement('div');
        card.className = 'habitacion-card';
        const imagenUrl = obtenerImagenPrincipalHabitacion(habitacion);
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

    renderPaginationControls('habitaciones', contenedor, paginacion.totalItems, paginacion.totalPages, paginacion.currentPage, () => mostrarHabitaciones(lista));
}




function mostrarServicios(servicios) {
    const contenedor = document.getElementById('servicios');
    if (!contenedor) return;
    
    console.log('Servicios recibidos:', servicios);
    contenedor.innerHTML = '';

    const lista = Array.isArray(servicios) ? servicios : [];
    const paginacion = getPaginatedItems(lista, 'servicios');
    const serviciosVisibles = paginacion.items;

    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay servicios disponibles</p>';
        renderPaginationControls('servicios', contenedor, 0, 0, 1, () => mostrarServicios(lista));
        return;
    }

    serviciosVisibles.forEach(servicio => {
        const card = document.createElement('div');
        card.className = 'servicio-card';
        card.innerHTML = `
            <h3>${servicio.NombreServicio}</h3>
            <p>${servicio.Descripcion || 'Sin descripción'}</p>
            <p class="precio">$${servicio.Costo}</p>
        `;
        contenedor.appendChild(card);
    });

    renderPaginationControls('servicios', contenedor, paginacion.totalItems, paginacion.totalPages, paginacion.currentPage, () => mostrarServicios(lista));
}

// ============================================
// FUNCIONES DE CARGA
// ============================================

async function cargarHabitaciones() {
    console.log('Cargando habitaciones...');
    try {
        const habitaciones = await obtenerHabitaciones();
        console.log('Habitaciones obtenidas:', habitaciones);
        resetPagination('habitaciones');
        mostrarHabitaciones(habitaciones);
        return habitaciones;
    } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        notificarErrorBackend('No se pudieron cargar habitaciones');
        resetPagination('habitaciones');
        mostrarHabitaciones([]);
        return [];
    }
}



async function cargarServicios() {
    console.log('Cargando servicios...');
    const servicios = await obtenerServicios();
    console.log('Servicios obtenidos:', servicios);
    notificarErrorBackend('No se pudieron cargar servicios');
    resetPagination('servicios');
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
const obtenerIconoAccion = (tipo) => {
    const iconos = {
        ver: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5c5.5 0 9.9 4.1 11 7-1.1 2.9-5.5 7-11 7S2.1 14.9 1 12c1.1-2.9 5.5-7 11-7Zm0 2C7.9 7 4.4 9.7 3.2 12 4.4 14.3 7.9 17 12 17s7.6-2.7 8.8-5C19.6 9.7 16.1 7 12 7Zm0 1.5A3.5 3.5 0 1 1 12 16a3.5 3.5 0 0 1 0-7Zm0 2A1.5 1.5 0 1 0 12 13a1.5 1.5 0 0 0 0-3Z"/></svg>',
        editar: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17.3V21h3.7L17.9 9.8l-3.7-3.7L3 17.3Zm18-10.6a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.7 3.7 1.8-1.8Z"/></svg>',
        eliminar: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM6 7h12l-1 14H7L6 7Z"/></svg>'
    };

    return iconos[tipo] || '';
};

const obtenerBotonIcono = (accion, claseExtra, titulo, ariaLabel, atributoAccion, idRegistro) => `
    <button type="button" class="btn-mini btn-mini-icon ${claseExtra}" ${atributoAccion ? `data-${atributoAccion}="${accion}"` : ''} ${idRegistro ? `data-id="${escaparHtml(idRegistro)}"` : ''} title="${escaparHtml(titulo)}" aria-label="${escaparHtml(ariaLabel)}">
        ${obtenerIconoAccion(accion)}
    </button>
`;

const obtenerEstadoTextoHabitacion = (estado) => normalizarEstadoHabitacion(estado).texto;

const obtenerEstadoTextoServicio = (estado) => normalizarEstadoServicio(estado).texto;

const obtenerClaseEstadoServicio = (estado) => normalizarEstadoServicio(estado).clase;

const abrirDetalleAdmin = ({ titulo, contenido, tipo }) => {
    const modal = document.getElementById('modal-detalle-admin');
    const modalTitulo = document.getElementById('detalle-admin-titulo');
    const modalContenido = document.getElementById('detalle-admin-contenido');

    if (!modal || !modalTitulo || !modalContenido) return;

    cerrarModalesCRUD();
    modalTitulo.textContent = titulo;
    modalContenido.innerHTML = contenido;
    modal.dataset.detalleTipo = tipo || '';
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
};

const cerrarDetalleAdmin = () => {
    const modal = document.getElementById('modal-detalle-admin');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.dataset.detalleTipo = '';
    document.body.classList.remove('modal-open');
};

const renderDetalleItem = (etiqueta, valor) => `
    <div class="detalle-admin-item">
        <span>${escaparHtml(etiqueta)}</span>
        <strong>${valor || 'Sin dato'}</strong>
    </div>
`;

const renderDetalleCabecera = (tipo, titulo, estadoTexto, estadoClase, descripcion) => `
    <div class="detalle-admin-header">
        <div class="detalle-admin-header-copy">
            <span class="detalle-admin-kicker">${escaparHtml(tipo)}</span>
            <h4>${escaparHtml(titulo)}</h4>
            <p>${escaparHtml(descripcion)}</p>
        </div>
        <span class="detalle-estado ${escaparHtml(estadoClase)}">${escaparHtml(estadoTexto)}</span>
    </div>
`;

const obtenerImagenesDetalleHabitacion = (valor) => {
    if (!valor) return [];

    if (Array.isArray(valor)) {
        return valor.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (valor && valor.type === 'Buffer' && Array.isArray(valor.data)) {
        try {
            let textoBuffer = '';
            for (let i = 0; i < valor.data.length; i += 1) {
                textoBuffer += String.fromCharCode(valor.data[i]);
            }
            valor = textoBuffer;
        } catch (error) {
            console.warn('No se pudo convertir la imagen del detalle a string:', error);
            return [];
        }
    }

    const texto = String(valor).trim();
    if (!texto) return [];

    try {
        if (texto.startsWith('[') || texto.startsWith('{')) {
            const parsed = JSON.parse(texto);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item || '').trim()).filter(Boolean);
            }
        }
    } catch {
        // Si no es JSON válido, seguimos con la extracción por patrón.
    }

    const coincidencias = texto.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s"'<>]+|(?:\.\.\/|\.\/|\/)[^\s"'<>]+/g);
    if (coincidencias && coincidencias.length > 0) {
        return coincidencias.map((item) => item.trim()).filter(Boolean);
    }

    return [texto];
};

const obtenerImagenesHabitacionFormulario = () => {
    const campoImagen = document.getElementById('habitacion-admin-imagen');
    const imagenesTexto = obtenerImagenesDetalleHabitacion(campoImagen?.value || '');

    const imagenes = [];
    const vistos = new Set();

    imagenesTexto.forEach((imagen) => {
        const normalizada = String(imagen || '').trim();
        if (!normalizada) return;

        const clave = normalizada.toLowerCase();
        if (vistos.has(clave)) return;

        vistos.add(clave);
        imagenes.push(normalizada);
    });

    return imagenes;
};

const serializarImagenesHabitacion = (imagenes) => {
    const lista = Array.isArray(imagenes)
        ? imagenes.map((imagen) => String(imagen || '').trim()).filter(Boolean)
        : [];

    if (lista.length === 0) {
        return null;
    }

    if (lista.length === 1) {
        return lista[0];
    }

    return JSON.stringify(lista);
};

const obtenerImagenesHabitacionDetalle = (habitacion) => {
    const candidatos = [
        habitacion?.ImagenesHabitacion,
        habitacion?.GaleriaHabitacion,
        habitacion?.FotosHabitacion,
        habitacion?.Fotos,
        habitacion?.ImagenHabitacion
    ].filter((item) => item !== undefined && item !== null && item !== '');

    const imagenes = [];

    candidatos.forEach((valor) => {
        if (Array.isArray(valor)) {
            valor.forEach((item) => {
                const texto = String(item || '').trim();
                if (texto) imagenes.push(texto);
            });
            return;
        }

        if (typeof valor === 'string') {
            const texto = valor.trim();
            if (!texto) return;

            if (texto.startsWith('[')) {
                try {
                    const parsed = JSON.parse(texto);
                    if (Array.isArray(parsed)) {
                        parsed.forEach((item) => {
                            const itemTexto = String(item || '').trim();
                            if (itemTexto) imagenes.push(itemTexto);
                        });
                        return;
                    }
                } catch {
                    // Si no es JSON válido, continúa con el texto crudo.
                }
            }

            const separadas = obtenerImagenesDetalleHabitacion(texto);
            if (separadas.length > 0) {
                imagenes.push(...separadas);
            }
            return;
        }

        const separadas = obtenerImagenesDetalleHabitacion(valor);
        if (separadas.length > 0) {
            imagenes.push(...separadas);
        }
    });

    const unicas = [];
    const vistos = new Set();

    imagenes.forEach((imagen) => {
        const normalizada = String(imagen || '').trim();
        if (!normalizada) return;
        const clave = normalizada.toLowerCase();
        if (vistos.has(clave)) return;
        vistos.add(clave);
        unicas.push(normalizada);
    });

    return unicas;
};

const obtenerImagenPrincipalHabitacion = (habitacion) => {
    const imagenes = obtenerImagenesDetalleHabitacion(habitacion?.ImagenHabitacion);
    return obtenerUrlImagen(imagenes[0] || habitacion?.ImagenHabitacion);
};

const renderGaleriaHabitacionDetalle = (imagenes, nombre) => {
    const lista = Array.isArray(imagenes) ? imagenes.filter(Boolean) : [];

    if (lista.length === 0) {
        return `
            <figure class="detalle-admin-figure detalle-admin-figure-empty">
                <img src="assets/images/default.svg" alt="${escaparHtml(nombre || 'Habitación')}">
            </figure>
        `;
    }

    const principal = lista[0];
    const miniaturas = lista.slice(1);

    return `
        <div class="detalle-admin-gallery">
            <figure class="detalle-admin-figure detalle-admin-figure-main">
                <img src="${escaparHtml(principal)}" alt="${escaparHtml(nombre || 'Habitación')}" onerror="this.src='assets/images/default.svg'">
            </figure>
            ${miniaturas.length > 0 ? `
                <div class="detalle-admin-thumbs">
                    ${miniaturas.map((imagen, indice) => `
                        <figure class="detalle-admin-thumb">
                            <img src="${escaparHtml(imagen)}" alt="${escaparHtml(nombre || 'Habitación')} ${indice + 2}" onerror="this.src='assets/images/default.svg'">
                        </figure>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
};

const abrirDetalleHabitacionAdmin = (habitacion) => {
    if (!habitacion) return;

    const imagenes = obtenerImagenesHabitacionDetalle(habitacion).map((imagen) => obtenerUrlImagen(imagen));
    const estadoHabitacion = normalizarEstadoHabitacion(habitacion.Estado);
    const totalImagenes = imagenes.length;
    const contenido = `
        ${renderDetalleCabecera(
            'Habitación',
            habitacion.NombreHabitacion || 'Sin nombre',
            estadoHabitacion.texto,
            estadoHabitacion.clase,
            'Información completa del registro seleccionado.'
        )}
        <div class="detalle-admin-grid detalle-admin-grid-habitacion">
            ${renderGaleriaHabitacionDetalle(imagenes, habitacion.NombreHabitacion)}
            <div class="detalle-admin-body">
                ${renderDetalleItem('ID', escaparHtml(obtenerIdHabitacion(habitacion)))}
                ${renderDetalleItem('Nombre', escaparHtml(habitacion.NombreHabitacion || 'Sin nombre'))}
                ${renderDetalleItem('Descripción', escaparHtml(habitacion.Descripcion || 'Sin descripción'))}
                ${renderDetalleItem('Costo', escaparHtml(formatearCostoHabitacion(habitacion.Costo)))}
                ${renderDetalleItem('Estado', `<span class="detalle-estado ${estadoHabitacion.clase}">${escaparHtml(estadoHabitacion.texto)}</span>`)}
                ${renderDetalleItem('Imágenes', `<span class="detalle-admin-code">${escaparHtml(totalImagenes > 0 ? `${totalImagenes} imagen${totalImagenes === 1 ? '' : 'es'} cargada${totalImagenes === 1 ? '' : 's'}` : 'Sin imagen')}</span>`)}
            </div>
        </div>
    `;

    abrirDetalleAdmin({
        titulo: `Detalle de habitación #${obtenerIdHabitacion(habitacion)}`,
        contenido,
        tipo: 'habitacion'
    });
};

const abrirDetalleServicioAdmin = (servicio) => {
    if (!servicio) return;

    const estadoServicio = normalizarEstadoServicio(servicio.Estado);

    const contenido = `
        ${renderDetalleCabecera(
            'Servicio',
            servicio.NombreServicio || 'Sin nombre',
            estadoServicio.texto,
            estadoServicio.clase,
            'Información completa del servicio seleccionado.'
        )}
        <div class="detalle-admin-grid detalle-admin-grid-servicio">
            <div class="detalle-admin-body detalle-admin-body-full">
                ${renderDetalleItem('ID', escaparHtml(obtenerIdServicio(servicio)))}
                ${renderDetalleItem('Nombre', escaparHtml(servicio.NombreServicio || 'Sin nombre'))}
                ${renderDetalleItem('Descripción', escaparHtml(servicio.Descripcion || 'Sin descripción'))}
                ${renderDetalleItem('Duración', escaparHtml(servicio.Duracion ? `${servicio.Duracion} min` : 'Sin duración'))}
                ${renderDetalleItem('Personas', escaparHtml(servicio.CantidadMaximaPersonas || 'Sin dato'))}
                ${renderDetalleItem('Costo', escaparHtml(formatearCostoServicio(servicio.Costo)))}
                ${renderDetalleItem('Estado', `<span class="detalle-estado ${estadoServicio.clase}">${escaparHtml(estadoServicio.texto)}</span>`)}
            </div>
        </div>
    `;

    abrirDetalleAdmin({
        titulo: `Detalle de servicio #${obtenerIdServicio(servicio)}`,
        contenido,
        tipo: 'servicio'
    });
};

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
    const mensajes = [
        document.getElementById('mensaje-habitacion-admin'),
        document.getElementById('mensaje-habitacion-admin-modal')
    ].filter(Boolean);

    if (!mensajes.length) return;

    mensajes.forEach((mensaje) => {
        mensaje.textContent = texto || '';
        mensaje.className = 'crud-habitaciones-mensaje';
        mensaje.style.color = '';
        mensaje.style.background = '';
        mensaje.style.border = '';
        mensaje.style.fontWeight = '';

        if (tipo === 'ok') {
            mensaje.classList.add('exito');
        } else if (tipo === 'error') {
            mensaje.classList.add('error');
        }

        if (tipo === 'ok' || tipo === 'exito') {
            mensaje.style.setProperty('color', '#14532d', 'important');
            mensaje.style.setProperty('background', 'rgba(20, 83, 45, 0.16)', 'important');
            mensaje.style.setProperty('border', '1px solid rgba(20, 83, 45, 0.45)', 'important');
            mensaje.style.setProperty('font-weight', '700', 'important');
            mensaje.classList.add('exito');
        }
    });
};

const esErrorDuplicadoBackend = (mensaje) => {
    const texto = normalizarTexto(mensaje);
    return /duplicate|duplicad|ya existe|unique|constraint|exists/.test(texto);
};

const obtenerMensajeErrorGuardado = (mensajeDuplicado, mensajeFallback) => {
    const apiError = typeof getApiLastError === 'function' ? getApiLastError() : '';

    if (apiError) {
        if (esErrorDuplicadoBackend(apiError)) {
            return mensajeDuplicado;
        }

        return apiError;
    }

    return mensajeFallback;
};

const cerrarModalesCRUD = () => {
    const modales = [
        document.getElementById('modal-habitacion-admin'),
        document.getElementById('modal-servicio-admin')
    ].filter(Boolean);

    modales.forEach((modal) => {
        modal.classList.add('hidden');
    });

    document.body.classList.remove('modal-open');
};

const nombresCoinciden = (valorA, valorB) => normalizarTexto(valorA) === normalizarTexto(valorB);

const existeHabitacionConNombre = (nombre, idActual = '') => {
    return habitacionesAdminCargadas.some((habitacion) => {
        const mismoNombre = nombresCoinciden(habitacion.NombreHabitacion, nombre);
        const mismoRegistro = String(obtenerIdHabitacion(habitacion)) === String(idActual);
        return mismoNombre && !mismoRegistro;
    });
};

const existeServicioConNombre = (nombre, idActual = '') => {
    return serviciosCargados.some((servicio) => {
        const mismoNombre = nombresCoinciden(servicio.NombreServicio, nombre);
        const mismoRegistro = String(obtenerIdServicio(servicio)) === String(idActual);
        return mismoNombre && !mismoRegistro;
    });
};

const actualizarValidacionNombreHabitacionAdmin = () => {
    const campoId = document.getElementById('habitacion-admin-id');
    const campoNombre = document.getElementById('habitacion-admin-nombre');
    if (!campoNombre) return;

    const mensaje = document.getElementById('mensaje-habitacion-admin-modal');
    const idActual = campoId?.value?.trim() || '';
    const nombre = campoNombre.value?.trim() || '';
    const duplicado = nombre ? existeHabitacionConNombre(nombre, idActual) : false;

    campoNombre.setCustomValidity(duplicado ? 'Ya existe una habitación con ese nombre.' : '');
    campoNombre.classList.toggle('input-error', duplicado);

    if (duplicado) {
        if (mensaje) {
            mensaje.textContent = 'Ya existe una habitación con ese nombre. Usa otro nombre para poder guardarla.';
            mensaje.className = 'crud-habitaciones-mensaje error';
        }
        return;
    }

    if (mensaje && normalizarTexto(mensaje.textContent).includes('ya existe una habitación con ese nombre')) {
        mensaje.textContent = '';
        mensaje.className = 'crud-habitaciones-mensaje';
    }
};

const actualizarValidacionNombreServicioAdmin = () => {
    const campoId = document.getElementById('servicio-admin-id');
    const campoNombre = document.getElementById('servicio-admin-nombre');
    if (!campoNombre) return;

    const mensaje = document.getElementById('mensaje-servicio-admin-modal');
    const idActual = campoId?.value?.trim() || '';
    const nombre = campoNombre.value?.trim() || '';
    const duplicado = nombre ? existeServicioConNombre(nombre, idActual) : false;

    campoNombre.setCustomValidity(duplicado ? 'Ya existe un servicio con ese nombre.' : '');
    campoNombre.classList.toggle('input-error', duplicado);

    if (duplicado) {
        if (mensaje) {
            mensaje.textContent = 'Ya existe un servicio con ese nombre. Usa otro nombre para poder guardarlo.';
            mensaje.className = 'crud-servicios-mensaje error';
        }
        return;
    }

    if (mensaje && normalizarTexto(mensaje.textContent).includes('ya existe un servicio con ese nombre')) {
        mensaje.textContent = '';
        mensaje.className = 'crud-servicios-mensaje';
    }
};

const abrirModalHabitacionAdmin = () => {
    cerrarModalesCRUD();
    const modal = document.getElementById('modal-habitacion-admin');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
};

const cerrarModalHabitacionAdmin = () => {
    const modal = document.getElementById('modal-habitacion-admin');
    if (!modal) return;
    modal.classList.add('hidden');
    if (document.getElementById('modal-servicio-admin')?.classList.contains('hidden')) {
        document.body.classList.remove('modal-open');
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
    const paginacion = getPaginatedItems(habitacionesFiltradas, 'habitacionesAdmin');
    const habitacionesVisibles = paginacion.items;

    actualizarResumenHabitacionesAdmin(habitacionesAdminCargadas);

    if (habitacionesFiltradas.length === 0) {
        contenedor.innerHTML = `
            <tr>
                <td colspan="6" class="mensaje-vacio">No hay habitaciones que coincidan con el filtro actual.</td>
            </tr>
        `;
        const tablaWrapVacio = contenedor.closest('.crud-habitaciones-tabla-wrap') || contenedor;
        renderPaginationControls('habitacionesAdmin', tablaWrapVacio, 0, 0, 1, renderizarHabitacionesAdmin);
        return;
    }

    contenedor.innerHTML = habitacionesVisibles.map((habitacion) => {
        const idHabitacion = obtenerIdHabitacion(habitacion);
        const estado = normalizarEstadoHabitacion(habitacion.Estado);
        const imagenUrl = obtenerImagenPrincipalHabitacion(habitacion);
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
                        ${obtenerBotonIcono('ver', 'btn-mini-ver', 'Ver detalle', `Ver detalle de ${habitacion.NombreHabitacion || 'habitación'}`, 'accion-habitacion', idHabitacion)}
                        ${obtenerBotonIcono('editar', 'btn-mini-editar', 'Editar', `Editar ${habitacion.NombreHabitacion || 'habitación'}`, 'accion-habitacion', idHabitacion)}
                        ${obtenerBotonIcono('eliminar', 'btn-mini-eliminar', 'Eliminar', `Eliminar ${habitacion.NombreHabitacion || 'habitación'}`, 'accion-habitacion', idHabitacion)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const tablaWrap = contenedor.closest('.crud-habitaciones-tabla-wrap') || contenedor;
    renderPaginationControls('habitacionesAdmin', tablaWrap, paginacion.totalItems, paginacion.totalPages, paginacion.currentPage, renderizarHabitacionesAdmin);
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
    const titulo = document.getElementById('habitacion-admin-form-title');
    const botonGuardar = document.getElementById('btn-habitacion-admin-guardar');

    if (formulario) formulario.reset();
    if (campoId) campoId.value = '';
    if (campoNombre) campoNombre.value = '';
    if (campoDescripcion) campoDescripcion.value = '';
    if (campoCosto) campoCosto.value = '';
    if (campoEstado) campoEstado.value = '1';
    if (campoImagen) campoImagen.value = '';
    if (titulo) titulo.textContent = 'Crear habitación';
    if (botonGuardar) botonGuardar.textContent = 'Guardar habitación';
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
    const titulo = document.getElementById('habitacion-admin-form-title');
    const botonGuardar = document.getElementById('btn-habitacion-admin-guardar');

    if (!habitacion) return;

    if (campoId) campoId.value = obtenerIdHabitacion(habitacion);
    if (campoNombre) campoNombre.value = habitacion.NombreHabitacion || '';
    if (campoDescripcion) campoDescripcion.value = habitacion.Descripcion || '';
    if (campoCosto) campoCosto.value = habitacion.Costo ?? '';
    if (campoEstado) campoEstado.value = normalizarEstadoHabitacion(habitacion.Estado).activo ? '1' : '0';
    if (campoImagen) {
        const imagenesExistentes = obtenerImagenesDetalleHabitacion(habitacion.ImagenHabitacion);
        campoImagen.value = imagenesExistentes.join('\n');
    }
    mostrarPreviewHabitacionAdmin(campoImagen?.value ? obtenerUrlImagen(obtenerImagenesDetalleHabitacion(campoImagen.value)[0] || campoImagen.value) : '');
    if (titulo) titulo.textContent = `Editar habitación #${obtenerIdHabitacion(habitacion)}`;
    if (botonGuardar) botonGuardar.textContent = 'Actualizar habitación';

    mostrarMensajeHabitacionAdmin(`Editando ${habitacion.NombreHabitacion || 'la habitación seleccionada'}.`, 'ok');
    abrirModalHabitacionAdmin();
    actualizarValidacionNombreHabitacionAdmin();
};

async function cargarHabitacionesAdmin() {
    const contenedor = document.getElementById('habitaciones-admin-tbody');
    if (!contenedor) return;

    try {
        mostrarMensajeHabitacionAdmin('Cargando habitaciones...');
        habitacionesAdminCargadas = await obtenerHabitaciones();
        resetPagination('habitacionesAdmin');
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

const limpiarEstadoErrorCampos = (idsCampos = []) => {
    idsCampos.forEach((idCampo) => {
        const campo = document.getElementById(idCampo);
        if (campo) {
            campo.classList.remove('input-error');
        }
    });
};

const validarCamposObligatorios = (definicionesCampos = []) => {
    for (const definicion of definicionesCampos) {
        const { id, nombre } = definicion;
        const campo = document.getElementById(id);
        const valor = campo?.value;
        const valorNormalizado = typeof valor === 'string' ? valor.trim() : valor;

        if (valorNormalizado === '' || valorNormalizado === null || valorNormalizado === undefined) {
            if (campo) {
                campo.classList.add('input-error');
                if (typeof campo.focus === 'function') {
                    campo.focus();
                }
            }
            return `El campo ${nombre} es obligatorio.`;
        }
    }

    return '';
};

async function guardarHabitacionAdmin(event) {
    event.preventDefault();

    const formulario = document.getElementById('form-habitacion-admin');
    const campoId = document.getElementById('habitacion-admin-id');
    const campoNombre = document.getElementById('habitacion-admin-nombre');
    const campoDescripcion = document.getElementById('habitacion-admin-descripcion');
    const campoCosto = document.getElementById('habitacion-admin-costo');
    const campoEstado = document.getElementById('habitacion-admin-estado');
    const botonGuardar = document.getElementById('btn-habitacion-admin-guardar');

    const idHabitacion = campoId?.value?.trim();
    const nombreHabitacion = campoNombre?.value?.trim();
    const descripcion = campoDescripcion?.value?.trim();
    const costo = campoCosto?.value;
    const estado = campoEstado?.value ?? '1';
    const imagenesHabitacion = obtenerImagenesHabitacionFormulario();
    const imagenFinal = serializarImagenesHabitacion(imagenesHabitacion);

    limpiarEstadoErrorCampos([
        'habitacion-admin-nombre',
        'habitacion-admin-descripcion',
        'habitacion-admin-costo',
        'habitacion-admin-estado'
    ]);

    if (formulario && !formulario.checkValidity()) {
        formulario.reportValidity();
        mostrarMensajeHabitacionAdmin('Completa todos los campos obligatorios del formulario.', 'error');
        return;
    }

    const mensajeCamposObligatorios = validarCamposObligatorios([
        { id: 'habitacion-admin-nombre', nombre: 'Nombre de la habitación' },
        { id: 'habitacion-admin-descripcion', nombre: 'Descripción' },
        { id: 'habitacion-admin-costo', nombre: 'Costo' },
        { id: 'habitacion-admin-estado', nombre: 'Estado' }
    ]);

    if (mensajeCamposObligatorios) {
        mostrarMensajeHabitacionAdmin(mensajeCamposObligatorios, 'error');
        return;
    }

    if (!nombreHabitacion || !descripcion || !costo) {
        mostrarMensajeHabitacionAdmin('Nombre, descripción y costo son obligatorios.', 'error');
        return;
    }

    if (existeHabitacionConNombre(nombreHabitacion, idHabitacion)) {
        mostrarMensajeHabitacionAdmin('Ya existe una habitación con ese nombre. Usa otro nombre para poder guardarla.', 'error');
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
            throw new Error(obtenerMensajeErrorGuardado('Ya existe una habitación con ese nombre. Usa otro nombre para poder guardarla.', 'No se pudo guardar la habitación'));
        }

        limpiarFormularioHabitacionAdmin(false);
        await cargarHabitacionesAdmin();
        mostrarMensajeHabitacionAdmin(idHabitacion ? 'Habitación actualizada correctamente.' : 'Habitación creada correctamente.', 'ok');
        cerrarModalHabitacionAdmin();

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
    const botonNueva = document.getElementById('btn-nueva-habitacion-admin');
    const botonCerrarModal = document.getElementById('btn-cerrar-modal-habitacion');
    const modalHabitacion = document.getElementById('modal-habitacion-admin');
    const buscador = document.getElementById('busqueda-habitaciones-admin');
    const filtroEstado = document.getElementById('filtro-estado-habitaciones-admin');
    const campoNombre = document.getElementById('habitacion-admin-nombre');
    const inputImagenTexto = document.getElementById('habitacion-admin-imagen');
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

    if (botonNueva && !botonNueva.dataset.crudHabitacionesInicializado) {
        botonNueva.addEventListener('click', () => {
            limpiarFormularioHabitacionAdmin(false);
            abrirModalHabitacionAdmin();
        });
        botonNueva.dataset.crudHabitacionesInicializado = 'true';
    }

    if (botonCerrarModal && !botonCerrarModal.dataset.crudHabitacionesInicializado) {
        botonCerrarModal.addEventListener('click', cerrarModalHabitacionAdmin);
        botonCerrarModal.dataset.crudHabitacionesInicializado = 'true';
    }

    if (campoNombre && !campoNombre.dataset.crudHabitacionesInicializado) {
        campoNombre.addEventListener('input', actualizarValidacionNombreHabitacionAdmin);
        campoNombre.addEventListener('blur', actualizarValidacionNombreHabitacionAdmin);
        campoNombre.dataset.crudHabitacionesInicializado = 'true';
    }

    if (modalHabitacion && !modalHabitacion.dataset.crudHabitacionesInicializado) {
        modalHabitacion.addEventListener('click', (event) => {
            if (event.target === modalHabitacion) {
                cerrarModalHabitacionAdmin();
            }
        });
        modalHabitacion.dataset.crudHabitacionesInicializado = 'true';
    }

    if (buscador && !buscador.dataset.crudHabitacionesInicializado) {
        buscador.addEventListener('input', () => {
            resetPagination('habitacionesAdmin');
            renderizarHabitacionesAdmin();
        });
        buscador.dataset.crudHabitacionesInicializado = 'true';
    }

    if (filtroEstado && !filtroEstado.dataset.crudHabitacionesInicializado) {
        filtroEstado.addEventListener('change', () => {
            resetPagination('habitacionesAdmin');
            renderizarHabitacionesAdmin();
        });
        filtroEstado.dataset.crudHabitacionesInicializado = 'true';
    }

    if (inputImagenTexto && !inputImagenTexto.dataset.crudHabitacionesInicializado) {
        inputImagenTexto.addEventListener('input', () => {
            const valor = inputImagenTexto.value.trim();
            const vistaPrevia = valor ? obtenerUrlImagen(obtenerImagenesDetalleHabitacion(valor)[0] || valor) : '';

            mostrarPreviewHabitacionAdmin(vistaPrevia);
        });
        inputImagenTexto.dataset.crudHabitacionesInicializado = 'true';
    }

    if (!document.body.dataset.crudHabitacionesEscapeInicializado) {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                cerrarModalHabitacionAdmin();
            }
        });
        document.body.dataset.crudHabitacionesEscapeInicializado = 'true';
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

            if (accion === 'ver') {
                const habitacion = habitacionesAdminCargadas.find((item) => String(obtenerIdHabitacion(item)) === String(id));
                if (habitacion) {
                    abrirDetalleHabitacionAdmin(habitacion);
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

    const detalleModal = document.getElementById('modal-detalle-admin');
    const cerrarDetalle = document.getElementById('btn-cerrar-modal-detalle');

    if (detalleModal && !detalleModal.dataset.detalleInicializado) {
        detalleModal.addEventListener('click', (event) => {
            if (event.target === detalleModal) {
                cerrarDetalleAdmin();
            }
        });
        detalleModal.dataset.detalleInicializado = 'true';
    }

    if (cerrarDetalle && !cerrarDetalle.dataset.detalleInicializado) {
        cerrarDetalle.addEventListener('click', cerrarDetalleAdmin);
        cerrarDetalle.dataset.detalleInicializado = 'true';
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
        if (seccion === 'administrar-habitaciones') {
            cargarHabitacionesAdmin();
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
    const elementos = [
        document.getElementById('mensaje-servicio-admin'),
        document.getElementById('mensaje-servicio-admin-modal')
    ].filter(Boolean);

    if (!elementos.length) return;

    elementos.forEach((elemento) => {
        elemento.textContent = mensaje;
        elemento.className = 'crud-servicios-mensaje';
        elemento.style.color = '';
        elemento.style.background = '';
        elemento.style.border = '';
        elemento.style.fontWeight = '';

        if (tipo !== 'info') {
            elemento.classList.add(tipo);
        }

        if (tipo === 'ok' || tipo === 'exito') {
            elemento.style.setProperty('color', '#14532d', 'important');
            elemento.style.setProperty('background', 'rgba(20, 83, 45, 0.16)', 'important');
            elemento.style.setProperty('border', '1px solid rgba(20, 83, 45, 0.45)', 'important');
            elemento.style.setProperty('font-weight', '700', 'important');
            elemento.classList.add('exito');
        }
    });
};

const abrirModalServicioAdmin = () => {
    cerrarModalesCRUD();
    const modal = document.getElementById('modal-servicio-admin');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
};

const cerrarModalServicioAdmin = () => {
    const modal = document.getElementById('modal-servicio-admin');
    if (!modal) return;
    modal.classList.add('hidden');
    if (document.getElementById('modal-habitacion-admin')?.classList.contains('hidden')) {
        document.body.classList.remove('modal-open');
    }
};

async function cargarServiciosAdmin() {
    try {
        serviciosCargados = await obtenerServicios();
        resetPagination('serviciosAdmin');
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
    const paginacion = getPaginatedItems(serviciosFiltrados, 'serviciosAdmin');
    const serviciosVisibles = paginacion.items;

    actualizarResumenServiciosAdmin(serviciosCargados);

    if (serviciosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <tr>
                <td colspan="7" class="mensaje-vacio">No hay servicios que coincidan con el filtro actual.</td>
            </tr>
        `;
        const tablaWrapVacio = contenedor.closest('.crud-servicios-tabla-wrap') || contenedor;
        renderPaginationControls('serviciosAdmin', tablaWrapVacio, 0, 0, 1, renderizarServiciosAdmin);
        return;
    }

    contenedor.innerHTML = serviciosVisibles.map((servicio) => {
        const idServicio = obtenerIdServicio(servicio);
        const estado = normalizarEstadoServicio(servicio.Estado);
        const switchId = `switch-servicio-${idServicio}`;

        return `
            <tr>
                <td>
                    <div class="crud-servicios-nombre">${escaparHtml(servicio.NombreServicio || 'Sin nombre')}</div>
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
                        ${obtenerBotonIcono('ver', 'btn-mini-ver', 'Ver detalle', `Ver detalle de ${servicio.NombreServicio || 'servicio'}`, 'accion-servicio', idServicio)}
                        ${obtenerBotonIcono('editar', 'btn-mini-editar', 'Editar', `Editar ${servicio.NombreServicio || 'servicio'}`, 'accion-servicio', idServicio)}
                        ${obtenerBotonIcono('eliminar', 'btn-mini-eliminar', 'Eliminar', `Eliminar ${servicio.NombreServicio || 'servicio'}`, 'accion-servicio', idServicio)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const tablaWrap = contenedor.closest('.crud-servicios-tabla-wrap') || contenedor;
    renderPaginationControls('serviciosAdmin', tablaWrap, paginacion.totalItems, paginacion.totalPages, paginacion.currentPage, renderizarServiciosAdmin);
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

    abrirModalServicioAdmin();
    actualizarValidacionNombreServicioAdmin();
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

    if (existeServicioConNombre(nombre, id)) {
        mostrarMensajeServicioAdmin('Ya existe un servicio con ese nombre. Usa otro nombre para poder guardarlo.', 'error');
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

    limpiarEstadoErrorCampos([
        'servicio-admin-nombre',
        'servicio-admin-descripcion',
        'servicio-admin-duracion',
        'servicio-admin-cantidad-maxima',
        'servicio-admin-costo',
        'servicio-admin-estado'
    ]);

    const formulario = document.getElementById('form-servicio-admin');
    if (formulario && !formulario.checkValidity()) {
        formulario.reportValidity();
        mostrarMensajeServicioAdmin('Completa todos los campos obligatorios del formulario.', 'error');
        return;
    }

    const mensajeCamposObligatorios = validarCamposObligatorios([
        { id: 'servicio-admin-nombre', nombre: 'Nombre del servicio' },
        { id: 'servicio-admin-descripcion', nombre: 'Descripción' },
        { id: 'servicio-admin-duracion', nombre: 'Duración' },
        { id: 'servicio-admin-cantidad-maxima', nombre: 'Cantidad máxima de personas' },
        { id: 'servicio-admin-costo', nombre: 'Costo' },
        { id: 'servicio-admin-estado', nombre: 'Estado' }
    ]);

    if (mensajeCamposObligatorios) {
        mostrarMensajeServicioAdmin(mensajeCamposObligatorios, 'error');
        return;
    }

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
                throw new Error(obtenerMensajeErrorGuardado('Ya existe un servicio con ese nombre. Usa otro nombre para poder guardarlo.', 'No se pudo crear el servicio'));
            }
            mostrarMensajeServicioAdmin(`Servicio "${nombre}" creado correctamente.`, 'ok');
        }

        limpiarFormularioServicioAdmin(false);
        await cargarServiciosAdmin();
        cerrarModalServicioAdmin();
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
    const botonNuevo = document.getElementById('btn-nuevo-servicio-admin');
    const botonCerrarModal = document.getElementById('btn-cerrar-modal-servicio');
    const modalServicio = document.getElementById('modal-servicio-admin');
    const buscador = document.getElementById('busqueda-servicios-admin');
    const filtroEstado = document.getElementById('filtro-estado-servicios-admin');
    const campoNombre = document.getElementById('servicio-admin-nombre');
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

    if (botonNuevo && !botonNuevo.dataset.serviciosAdminInicializado) {
        botonNuevo.addEventListener('click', () => {
            limpiarFormularioServicioAdmin(false);
            abrirModalServicioAdmin();
        });
        botonNuevo.dataset.serviciosAdminInicializado = 'true';
    }

    if (botonCerrarModal && !botonCerrarModal.dataset.serviciosAdminInicializado) {
        botonCerrarModal.addEventListener('click', cerrarModalServicioAdmin);
        botonCerrarModal.dataset.serviciosAdminInicializado = 'true';
    }

    if (campoNombre && !campoNombre.dataset.serviciosAdminInicializado) {
        campoNombre.addEventListener('input', actualizarValidacionNombreServicioAdmin);
        campoNombre.addEventListener('blur', actualizarValidacionNombreServicioAdmin);
        campoNombre.dataset.serviciosAdminInicializado = 'true';
    }

    if (modalServicio && !modalServicio.dataset.serviciosAdminInicializado) {
        modalServicio.addEventListener('click', (event) => {
            if (event.target === modalServicio) {
                cerrarModalServicioAdmin();
            }
        });
        modalServicio.dataset.serviciosAdminInicializado = 'true';
    }

    if (!document.body.dataset.serviciosAdminEscapeInicializado) {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                cerrarModalServicioAdmin();
            }
        });
        document.body.dataset.serviciosAdminEscapeInicializado = 'true';
    }

    if (buscador && !buscador.dataset.serviciosAdminInicializado) {
        buscador.addEventListener('input', () => {
            renderizarServiciosAdmin();
        });
        buscador.dataset.serviciosAdminInicializado = 'true';
    }

    if (filtroEstado && !filtroEstado.dataset.serviciosAdminInicializado) {
        filtroEstado.addEventListener('change', () => {
            resetPagination('serviciosAdmin');
            renderizarServiciosAdmin();
        });
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

            if (accion === 'ver') {
                const servicio = serviciosCargados.find((item) => String(obtenerIdServicio(item)) === String(id));
                if (servicio) {
                    abrirDetalleServicioAdmin(servicio);
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

    const detalleModal = document.getElementById('modal-detalle-admin');
    const cerrarDetalle = document.getElementById('btn-cerrar-modal-detalle');

    if (detalleModal && !detalleModal.dataset.detalleInicializado) {
        detalleModal.addEventListener('click', (event) => {
            if (event.target === detalleModal) {
                cerrarDetalleAdmin();
            }
        });
        detalleModal.dataset.detalleInicializado = 'true';
    }

    if (cerrarDetalle && !cerrarDetalle.dataset.detalleInicializado) {
        cerrarDetalle.addEventListener('click', cerrarDetalleAdmin);
        cerrarDetalle.dataset.detalleInicializado = 'true';
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada, conectando con backend...');
    console.log('Backend URL:', 'http://localhost:3000/api');
    configurarModoContraste();

    if (window.location.hash === '#seccion-administrar-habitaciones' || window.location.hash === '#seccion-administrar-servicios') {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 0);
        }
    }
    
    // Cargar datos según la página actual
    if (document.getElementById('habitaciones')) {
        cargarHabitaciones();
    }
    

    
    if (document.getElementById('reservas')) {
        cargarReservas();
    }
    
    // Inicializar CRUD de habitaciones y servicios
    if (document.getElementById('form-habitacion-admin')) {
        configurarCRUDHabitaciones();
    }
    
    if (document.getElementById('form-servicio-admin')) {
        inicializarFormularioServiciosAdmin();
    }
    
    if (document.getElementById('habitaciones-admin-tbody')) {
        configurarCRUDHabitaciones();
        cargarHabitacionesAdmin();
    }
    



});





// ============================================
// FUNCIONES GLOBALES PARA EVENTOS ONCLICK
// ============================================

// Hacer funciones disponibles globalmente para los eventos onclick
window.cargarHabitacionesAdmin = cargarHabitacionesAdmin;
window.guardarHabitacionAdmin = guardarHabitacionAdmin;
window.eliminarHabitacionAdmin = eliminarHabitacionAdmin;
window.limpiarFormularioHabitacionAdmin = limpiarFormularioHabitacionAdmin;
