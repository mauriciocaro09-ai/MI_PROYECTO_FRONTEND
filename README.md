# 🏨 Hospedaje Digital - Frontend

Frontend del sistema de gestión de hospedaje digital. Consume datos del backend mediante API REST.

## 📁 Estructura del Proyecto

```
mi-proyecto-frontend/
├── index.html              # Página principal
├── /pages                  # Páginas adicionales
│   ├── nosotros.html
│   └── contacto.html
├── /css                    # Estilos
│   ├── reset.css          # Reset de estilos
│   ├── variables.css      # Variables CSS
│   └── styles.css         # Estilos principales
├── /js                     # JavaScript
│   ├── api.js             # ⭐ Funciones para consumir el backend
│   ├── app.js             # Lógica de la aplicación
│   └── eventos.js         # Eventos y formularios
├── /assets                 # Recursos
│   ├── /images
│   ├── /icons
│   └── /fonts
└── /components             # Componentes reutilizables
    ├── header.html
    └── footer.html
```

## 🚀 Cómo Usar

### 1. Asegúrate de que el backend esté corriendo

```bash
cd ../HOSPEDAJE_DIGITAL
npm start
```

El backend debe estar corriendo en `http://localhost:3000`

### 2. Abre el frontend

**Opción A: Live Server (Recomendado)**
- Instala la extensión "Live Server" en VSCode
- Click derecho en `index.html` → "Open with Live Server"
- Se abrirá en `http://localhost:5500` (o similar)

**Opción B: Directamente en el navegador**
- Abre el archivo `index.html` directamente en tu navegador
- Nota: Algunas funciones pueden no funcionar correctamente

**Opción C: http-server**
```bash
npx http-server -p 8080
```

## 📡 Conexión con el Backend

El archivo [`js/api.js`](js/api.js) contiene todas las funciones para comunicarse con el backend:

```javascript
// Configuración
const API_URL = 'http://localhost:3000/api';

// Funciones disponibles:
- obtenerHabitaciones()
- obtenerHabitacionPorId(id)
- crearHabitacion(habitacion)
- actualizarHabitacion(id, habitacion)
- eliminarHabitacion(id)

- obtenerClientes()
- crearCliente(cliente)
// ... y más
```

## 🎨 Personalización

### Cambiar Colores

Edita [`css/variables.css`](css/variables.css):

```css
:root {
    --color-primary: #2c3e50;    /* Color principal */
    --color-secondary: #3498db;  /* Color secundario */
    --color-accent: #e74c3c;     /* Color de acento */
    /* ... más variables */
}
```

### Cambiar Estilos

Edita [`css/styles.css`](css/styles.css) para modificar el diseño de los componentes.

## 📄 Páginas Disponibles

- **index.html** - Página principal con listado de habitaciones
- **pages/nosotros.html** - Información sobre el hospedaje
- **pages/contacto.html** - Formulario de contacto

## 🔧 Funciones Principales

### Cargar Habitaciones

```javascript
// En js/app.js
async function cargarHabitaciones() {
    const habitaciones = await obtenerHabitaciones();
    mostrarHabitaciones(habitaciones);
}
```

### Crear Reserva

```javascript
// En js/eventos.js
const reserva = {
    cliente_id: 1,
    habitacion_id: 2,
    fecha_entrada: '2026-04-01',
    fecha_salida: '2026-04-05',
    estado: 'confirmada'
};

const resultado = await crearReserva(reserva);
```

## 🐛 Solución de Problemas

### No se cargan las habitaciones

1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que CORS esté configurado en el backend

### Error de CORS

El backend ya tiene CORS configurado. Si aún tienes problemas:
- Asegúrate de que el backend esté corriendo
- Verifica la URL en [`js/api.js`](js/api.js)

### Las imágenes no se muestran

Las imágenes deben estar en la carpeta `assets/images/`. Si no tienes imágenes, se mostrará una imagen por defecto.

## 📝 Notas

- Los scripts deben cargarse en orden: `api.js` → `app.js` → `eventos.js`
- El archivo `api.js` es el más importante - contiene todas las funciones para el backend
- Puedes agregar más páginas en la carpeta `pages/`
- Los estilos son completamente personalizables

## 🎯 Próximos Pasos

1. Personaliza los colores y estilos
2. Agrega más páginas según necesites
3. Implementa funcionalidades adicionales
4. Agrega imágenes en `assets/images/`

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. La terminal del backend
3. Los archivos de documentación en la carpeta del backend
