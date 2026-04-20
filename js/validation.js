// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

// Validar que un campo no esté vacío
function validarRequerido(valor, nombreCampo) {
    if (!valor || valor.trim() === '') {
        return {
            valido: false,
            mensaje: `El campo ${nombreCampo} es requerido`
        };
    }
    return { valido: true };
}

// Validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        return {
            valido: false,
            mensaje: 'El formato del email no es válido'
        };
    }
    return { valido: true };
}

// Validar número de teléfono
function validarTelefono(telefono) {
    const regex = /^[0-9]{7,15}$/;
    if (!regex.test(telefono.replace(/\s/g, ''))) {
        return {
            valido: false,
            mensaje: 'El teléfono debe tener entre 7 y 15 dígitos'
        };
    }
    return { valido: true };
}

// Validar que un valor sea numérico
function validarNumerico(valor, nombreCampo) {
    if (isNaN(valor) || valor === '') {
        return {
            valido: false,
            mensaje: `El campo ${nombreCampo} debe ser un número`
        };
    }
    return { valido: true };
}

// Validar que un valor sea positivo
function validarPositivo(valor, nombreCampo) {
    if (parseFloat(valor) <= 0) {
        return {
            valido: false,
            mensaje: `El campo ${nombreCampo} debe ser un valor positivo`
        };
    }
    return { valido: true };
}

// Validar fecha
function validarFecha(fecha) {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
        return {
            valido: false,
            mensaje: 'La fecha no es válida'
        };
    }
    return { valido: true };
}

// Validar que una fecha sea futura
function validarFechaFutura(fecha, nombreCampo) {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaObj < hoy) {
        return {
            valido: false,
            mensaje: `La ${nombreCampo} debe ser una fecha futura`
        };
    }
    return { valido: true };
}

// Validar rango de fechas (entrada antes que salida)
function validarRangoFechas(fechaEntrada, fechaSalida) {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    
    if (salida <= entrada) {
        return {
            valido: false,
            mensaje: 'La fecha de salida debe ser posterior a la fecha de entrada'
        };
    }
    return { valido: true };
}

// Validar longitud mínima
function validarLongitudMinima(valor, minimo, nombreCampo) {
    if (valor.length < minimo) {
        return {
            valido: false,
            mensaje: `El campo ${nombreCampo} debe tener al menos ${minimo} caracteres`
        };
    }
    return { valido: true };
}

// Validar longitud máxima
function validarLongitudMaxima(valor, maximo, nombreCampo) {
    if (valor.length > maximo) {
        return {
            valido: false,
            mensaje: `El campo ${nombreCampo} no puede exceder ${maximo} caracteres`
        };
    }
    return { valido: true };
}

// Validar formulario de cliente
function validarFormularioCliente(cliente) {
    const errores = [];
    
    // Validar nombre
    const validacionNombre = validarRequerido(cliente.NombreCliente, 'Nombre');
    if (!validacionNombre.valido) {
        errores.push(validacionNombre.mensaje);
    }
    
    // Validar email
    const validacionEmail = validarEmail(cliente.EmailCliente);
    if (!validacionEmail.valido) {
        errores.push(validacionEmail.mensaje);
    }
    
    // Validar teléfono
    if (cliente.TelefonoCliente) {
        const validacionTelefono = validarTelefono(cliente.TelefonoCliente);
        if (!validacionTelefono.valido) {
            errores.push(validacionTelefono.mensaje);
        }
    }
    
    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// Validar formulario de reserva
function validarFormularioReserva(reserva) {
    const errores = [];
    
    // Validar habitación
    const validacionHabitacion = validarNumerico(reserva.IDHabitacion, 'Habitación');
    if (!validacionHabitacion.valido) {
        errores.push(validacionHabitacion.mensaje);
    }
    
    // Validar fecha de entrada
    const validacionFechaEntrada = validarFecha(reserva.FechaEntrada);
    if (!validacionFechaEntrada.valido) {
        errores.push(validacionFechaEntrada.mensaje);
    } else {
        const validacionFutura = validarFechaFutura(reserva.FechaEntrada, 'fecha de entrada');
        if (!validacionFutura.valido) {
            errores.push(validacionFutura.mensaje);
        }
    }
    
    // Validar fecha de salida
    const validacionFechaSalida = validarFecha(reserva.FechaSalida);
    if (!validacionFechaSalida.valido) {
        errores.push(validacionFechaSalida.mensaje);
    }
    
    // Validar rango de fechas
    if (reserva.FechaEntrada && reserva.FechaSalida) {
        const validacionRango = validarRangoFechas(reserva.FechaEntrada, reserva.FechaSalida);
        if (!validacionRango.valido) {
            errores.push(validacionRango.mensaje);
        }
    }
    
    // Validar número de adultos
    const validacionAdultos = validarNumerico(reserva.NumeroAdultos, 'Número de adultos');
    if (!validacionAdultos.valido) {
        errores.push(validacionAdultos.mensaje);
    } else {
        const validacionPositivo = validarPositivo(reserva.NumeroAdultos, 'Número de adultos');
        if (!validacionPositivo.valido) {
            errores.push(validacionPositivo.mensaje);
        }
    }
    
    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// Validar formulario de habitación
function validarFormularioHabitacion(habitacion) {
    const errores = [];
    
    // Validar nombre
    const validacionNombre = validarRequerido(habitacion.NombreHabitacion, 'Nombre');
    if (!validacionNombre.valido) {
        errores.push(validacionNombre.mensaje);
    }

    // Validar descripción
    const validacionDescripcion = validarRequerido(habitacion.Descripcion, 'Descripción');
    if (!validacionDescripcion.valido) {
        errores.push(validacionDescripcion.mensaje);
    }
    
    // Validar costo
    const validacionCosto = validarNumerico(habitacion.Costo, 'Costo');
    if (!validacionCosto.valido) {
        errores.push(validacionCosto.mensaje);
    } else {
        const validacionPositivo = validarPositivo(habitacion.Costo, 'Costo');
        if (!validacionPositivo.valido) {
            errores.push(validacionPositivo.mensaje);
        }
    }

    // Validar estado
    const validacionEstado = validarNumerico(habitacion.Estado, 'Estado');
    if (!validacionEstado.valido) {
        errores.push(validacionEstado.mensaje);
    }
    
    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// Validar formulario de servicio
function validarFormularioServicio(servicio) {
    const errores = [];
    
    // Validar nombre
    const validacionNombre = validarRequerido(servicio.NombreServicio, 'Nombre');
    if (!validacionNombre.valido) {
        errores.push(validacionNombre.mensaje);
    }

    // Validar descripción
    const validacionDescripcion = validarRequerido(servicio.Descripcion, 'Descripción');
    if (!validacionDescripcion.valido) {
        errores.push(validacionDescripcion.mensaje);
    }

    // Validar duración
    const validacionDuracion = validarNumerico(servicio.Duracion, 'Duración');
    if (!validacionDuracion.valido) {
        errores.push(validacionDuracion.mensaje);
    } else {
        const validacionDuracionPositiva = validarPositivo(servicio.Duracion, 'Duración');
        if (!validacionDuracionPositiva.valido) {
            errores.push(validacionDuracionPositiva.mensaje);
        }
    }
    
    // Validar costo
    const validacionCosto = validarNumerico(servicio.Costo, 'Costo');
    if (!validacionCosto.valido) {
        errores.push(validacionCosto.mensaje);
    } else {
        const validacionPositivo = validarPositivo(servicio.Costo, 'Costo');
        if (!validacionPositivo.valido) {
            errores.push(validacionPositivo.mensaje);
        }
    }
    
    // Validar cantidad máxima de personas
    const validacionCantidad = validarNumerico(servicio.CantidadMaximaPersonas, 'Cantidad máxima');
    if (!validacionCantidad.valido) {
        errores.push(validacionCantidad.mensaje);
    } else {
        const validacionCantidadPositiva = validarPositivo(servicio.CantidadMaximaPersonas, 'Cantidad máxima');
        if (!validacionCantidadPositiva.valido) {
            errores.push(validacionCantidadPositiva.mensaje);
        }
    }

    // Validar estado
    const validacionEstado = validarNumerico(servicio.Estado, 'Estado');
    if (!validacionEstado.valido) {
        errores.push(validacionEstado.mensaje);
    }
    
    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// Mostrar errores de validación
function mostrarErroresValidacion(errores, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.innerHTML = errores.map(error => 
            `<p class="error-validacion">${error}</p>`
        ).join('');
        contenedor.style.display = 'block';
    }
}

// Limpiar errores de validación
function limpiarErroresValidacion(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.innerHTML = '';
        contenedor.style.display = 'none';
    }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarRequerido,
        validarEmail,
        validarTelefono,
        validarNumerico,
        validarPositivo,
        validarFecha,
        validarFechaFutura,
        validarRangoFechas,
        validarLongitudMinima,
        validarLongitudMaxima,
        validarFormularioCliente,
        validarFormularioReserva,
        validarFormularioHabitacion,
        validarFormularioServicio,
        mostrarErroresValidacion,
        limpiarErroresValidacion
    };
}
