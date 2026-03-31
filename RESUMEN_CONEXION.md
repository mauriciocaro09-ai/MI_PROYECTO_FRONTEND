# 📋 Resumen de Conexión Frontend-Backend

## ✅ Estado Actual

### Backend Corregido
He corregido los siguientes archivos del backend para que coincidan con la estructura real de la base de datos MySQL `hospedaje`:

#### 1. [`src/models/Cliente.js`](../BACKEND/src/models/Cliente.js)
- ✅ Corregido para usar `NroDocumento` como clave primaria
- ✅ Campos actualizados: Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol

#### 2. [`src/models/servicios.js`](../BACKEND/src/models/servicios.js)
- ✅ Corregido para usar tabla `servicio` (sin 's')
- ✅ Mantiene campos: NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado

#### 3. [`src/models/reserva.js`](../BACKEND/src/models/reserva.js)
- ✅ Corregido para usar estructura real de la tabla `reserva`
- ✅ Campos actualizados: NroDocumentoCliente, IDHabitacion, FechaReserva, FechaInicio, FechaFinalizacion, Sub_Total, Descuento, IVA, Monto_Total, MetodoPago, IdEstadoReserva, id_usuario

#### 4. [`src/controllers/clientes.controller.js`](../BACKEND/src/controllers/clientes.controller.js)
- ✅ Corregido para usar `NroDocumento` como identificador
- ✅ Campos actualizados para coincidir con la base de datos

---

## 📁 Archivos Creados en el Frontend

### 1. [`js/config.js`](js/config.js)
```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    FETCH_TIMEOUT: 10000,
    ENABLE_LOGS: true,
    USE_MOCK_DATA: false
};
```

### 2. [`js/constants.js`](js/constants.js)
- Estados de habitaciones, reservas y clientes
- Tipos de documento y métodos de pago
- Mensajes del sistema

### 3. [`js/mock-data.js`](js/mock-data.js)
- Datos de ejemplo para desarrollo sin backend
- Funciones para CRUD mock

### 4. [`js/validation.js`](js/validation.js)
- Validación de formularios (email, teléfono, fechas)
- Validación de reservas, clientes, habitaciones y servicios

### 5. [`js/notifications.js`](js/notifications.js)
- Sistema de notificaciones visuales
- Mensajes de éxito, error, advertencia e información

---

## 🔧 Estructura Real de la Base de Datos

### Tabla `habitacion`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| IDHabitacion | int(11) | PK, auto_increment |
| NombreHabitacion | varchar(30) | Nombre de la habitación |
| ImagenHabitacion | blob | Imagen de la habitación |
| Descripcion | varchar(50) | Descripción |
| Costo | float | Precio por noche |
| Estado | tinyint(1) | Estado (0=inactivo, 1=activo) |

### Tabla `cliente`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| NroDocumento | varchar(50) | PK |
| Nombre | varchar(50) | Nombre del cliente |
| Apellido | varchar(50) | Apellido del cliente |
| Direccion | varchar(50) | Dirección |
| Email | varchar(50) | Correo electrónico |
| Telefono | varchar(50) | Teléfono |
| Estado | tinyint(1) | Estado (0=inactivo, 1=activo) |
| IDRol | int(11) | FK a tabla roles |

### Tabla `reserva`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| IdReserva | int(11) | PK, auto_increment |
| NroDocumentoCliente | varchar(50) | FK a cliente |
| FechaReserva | datetime | Fecha de creación |
| FechaInicio | date | Fecha de check-in |
| FechaFinalizacion | date | Fecha de check-out |
| Sub_Total | float | Subtotal |
| Descuento | float | Descuento aplicado |
| IVA | float | Impuesto |
| Monto_Total | float | Total a pagar |
| MetodoPago | int(11) | FK a metodopago |
| IdEstadoReserva | int(11) | FK a estadosreserva |
| id_usuario | int(11) | FK a usuarios |

### Tabla `servicio`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| IDServicio | int(11) | PK, auto_increment |
| NombreServicio | varchar(30) | Nombre del servicio |
| Descripcion | varchar(50) | Descripción |
| Duracion | varchar(50) | Duración del servicio |
| CantidadMaximaPersonas | int(11) | Capacidad máxima |
| Costo | float | Precio |
| Estado | tinyint(1) | Estado (0=inactivo, 1=activo) |

---

## 🚀 Pasos para Conectar

### 1. Verificar MySQL
```bash
# MySQL ya está corriendo en puerto 3306
# La base de datos 'hospedaje' ya existe
```

### 2. Iniciar el Backend
```bash
cd ../BACKEND
npm start
```

El backend iniciará en `http://localhost:3000`

### 3. Abrir el Frontend
Opción A - Live Server (Recomendado):
- Abre `index.html` con Live Server en VSCode
- Se abrirá en `http://localhost:5500`

Opción B - http-server:
```bash
cd mi-proyecto-frontend
npx http-server -p 8080
```

---

## 🔍 Verificar la Conexión

### 1. Verificar que el backend responde
Abre en tu navegador: `http://localhost:3000`

Deberías ver:
```json
{
  "message": "API de HOSPEDAJE_DIGITAL funcionando",
  "endpoints": {
    "habitaciones": "/api/habitaciones",
    "servicios": "/api/servicios",
    "clientes": "/api/clientes"
  }
}
```

### 2. Verificar endpoints de la API
- Habitaciones: `http://localhost:3000/api/habitaciones`
- Clientes: `http://localhost:3000/api/clientes`
- Reservas: `http://localhost:3000/api/reservas`
- Servicios: `http://localhost:3000/api/servicios`

### 3. Verificar estructura de tablas
`http://localhost:3000/api/debug/estructura`

---

## ⚠️ Notas Importantes

### Diferencias entre Frontend y Base de Datos

El frontend actualmente espera campos diferentes a los que tiene la base de datos:

| Frontend Espera | Base de Datos Real |
|----------------|-------------------|
| IDCliente | NroDocumento |
| NombreCliente | Nombre |
| EmailCliente | Email |
| TelefonoCliente | Telefono |
| FechaEntrada | FechaInicio |
| FechaSalida | FechaFinalizacion |
| CostoTotal | Monto_Total |

### Próximos Pasos

1. **Actualizar el frontend** para usar los nombres de campos correctos
2. **Probar la conexión** con el backend
3. **Verificar que los datos se muestren correctamente**

---

## 📞 Solución de Problemas

### Error: "No se puede conectar al backend"
1. Verifica que el backend esté corriendo en puerto 3000
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que CORS esté configurado correctamente

### Error: "Column not found"
1. Verifica que los modelos del backend usen los nombres correctos de columnas
2. Revisa la estructura de la base de datos con `DESCRIBE tabla;`

### Error: "Table doesn't exist"
1. Verifica que la tabla exista en la base de datos
2. Ejecuta el script `schema.sql` si es necesario

---

## 🎯 Resumen

✅ **Backend corregido** para usar la estructura real de la base de datos
✅ **Frontend configurado** con archivos necesarios
✅ **MySQL corriendo** en puerto 3306
✅ **Base de datos 'hospedaje'** existe con todas las tablas

**Siguiente paso**: Iniciar el backend y probar la conexión.
