# 🚀 Guía de Conexión Frontend-Backend

## ✅ Archivos Creados en el Frontend

He creado los siguientes archivos para conectar el frontend con el backend:

### 1. [`js/config.js`](js/config.js)
- Configuración de la URL del backend: `http://localhost:3000/api`
- Timeout para peticiones: 10 segundos
- Logs habilitados para desarrollo

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

## 🔧 Configuración del Backend

### Archivo `.env` creado en `../BACKEND/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hospedaje
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500
```

---

## 📋 Pasos para Conectar

### Paso 1: Verificar MySQL
Asegúrate de que MySQL esté corriendo y que la base de datos `hospedaje` exista.

```bash
# Verificar si MySQL está corriendo
mysql -u root -p

# Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS hospedaje;
USE hospedaje;
```

### Paso 2: Crear las Tablas
Ejecuta el script SQL del backend para crear las tablas:

```bash
cd ../BACKEND
mysql -u root -p hospedaje < src/database/schema.sql
```

### Paso 3: Iniciar el Backend
```bash
cd ../BACKEND
npm start
```

El backend iniciará en `http://localhost:3000`

### Paso 4: Iniciar el Frontend
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

## 🐛 Solución de Problemas

### Error: "No se puede conectar al backend"
1. Verifica que el backend esté corriendo en puerto 3000
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que CORS esté configurado correctamente

### Error: "Base de datos no encontrada"
1. Verifica que MySQL esté corriendo
2. Ejecuta el script `schema.sql` para crear las tablas
3. Verifica las credenciales en `.env`

### Error: "CORS bloqueado"
1. El backend ya tiene CORS configurado
2. Verifica que el frontend esté en `http://localhost:5500`
3. Si usas otro puerto, actualiza `CORS_ORIGIN` en `.env`

---

## 📁 Estructura del Proyecto

```
NODE/
├── BACKEND/                    # Backend Node.js/Express
│   ├── .env                   # Variables de entorno
│   ├── index.js               # Punto de entrada
│   ├── package.json           # Dependencias
│   └── src/
│       ├── app.js             # Configuración Express
│       ├── config/
│       │   └── database.js    # Configuración BD
│       ├── controllers/       # Controladores
│       ├── database/
│       │   ├── connection.js  # Conexión MySQL
│       │   └── schema.sql     # Script de tablas
│       ├── models/            # Modelos de datos
│       └── routes/            # Rutas de la API
│
└── mi-proyecto-frontend/      # Frontend HTML/CSS/JS
    ├── index.html             # Página principal
    ├── js/
    │   ├── config.js          # ✅ Configuración API
    │   ├── constants.js       # ✅ Constantes
    │   ├── mock-data.js       # ✅ Datos mock
    │   ├── validation.js      # ✅ Validaciones
    │   ├── notifications.js   # ✅ Notificaciones
    │   ├── api.js             # Funciones API
    │   ├── app.js             # Lógica aplicación
    │   └── eventos.js         # Eventos formularios
    ├── css/                   # Estilos
    └── pages/                 # Páginas adicionales
```

---

## 🎯 Próximos Pasos

1. ✅ Verificar que MySQL esté corriendo
2. ✅ Crear la base de datos `hospedaje`
3. ✅ Ejecutar el script `schema.sql`
4. ✅ Iniciar el backend (`npm start`)
5. ✅ Abrir el frontend con Live Server
6. ✅ Verificar la conexión en la consola del navegador

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa la terminal del backend
3. Verifica que MySQL esté corriendo
4. Verifica las credenciales en `.env`
