# Manual del Proyecto PetTime
### Guía completa para principiantes

---

## ¿Qué es PetTime?

PetTime es una aplicación web para **gestionar citas veterinarias** en la región de Pereira y Risaralda. Permite a los dueños de mascotas:

- Registrar a sus mascotas
- Agendar citas veterinarias
- Ver clínicas disponibles con calificaciones
- Llevar un historial de citas

---

## Índice

1. [Tecnologías usadas](#1-tecnologías-usadas)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Cómo funciona la aplicación (flujo general)](#3-cómo-funciona-la-aplicación-flujo-general)
4. [El Backend (servidor)](#4-el-backend-servidor)
5. [El Frontend (interfaz visual)](#5-el-frontend-interfaz-visual)
6. [La Base de Datos](#6-la-base-de-datos)
7. [Autenticación y seguridad](#7-autenticación-y-seguridad)
8. [Cómo correr el proyecto](#8-cómo-correr-el-proyecto)
9. [Glosario de términos](#9-glosario-de-términos)

---

## 1. Tecnologías usadas

Antes de entender el proyecto, es importante conocer las herramientas que usa.

### Frontend (lo que ve el usuario)

| Tecnología | ¿Qué es? | ¿Para qué se usa? |
|---|---|---|
| **React 19** | Librería de JavaScript | Construir la interfaz visual con componentes |
| **Vite** | Herramienta de construcción | Correr y compilar el frontend rápidamente |
| **Tailwind CSS** | Framework de CSS | Estilos visuales (colores, tamaños, etc.) |
| **React Router** | Librería de navegación | Manejar las "páginas" de la app sin recargar |
| **Axios** | Cliente HTTP | Hacer peticiones al servidor |
| **React Hot Toast** | Librería de notificaciones | Mostrar mensajes de éxito/error |
| **Lucide React** | Librería de íconos | Íconos visuales en la interfaz |

### Backend (el servidor)

| Tecnología | ¿Qué es? | ¿Para qué se usa? |
|---|---|---|
| **Node.js** | Entorno de ejecución | Correr JavaScript en el servidor |
| **Express** | Framework web | Crear el servidor y manejar rutas/peticiones |
| **Supabase** | Base de datos en la nube | Guardar todos los datos (PostgreSQL) |
| **JWT** | Tokens de autenticación | Verificar que el usuario está logueado |
| **bcryptjs** | Librería de cifrado | Guardar contraseñas de forma segura |
| **dotenv** | Manejo de variables de entorno | Guardar configuraciones secretas |
| **CORS** | Middleware de seguridad | Permitir que el frontend se comunique con el backend |

---

## 2. Estructura de carpetas

```
PetTime/                          ← Raíz del proyecto
├── client/                       ← Frontend (React)
│   └── src/
│       ├── main.jsx              ← Punto de entrada de React
│       ├── App.jsx               ← Componente principal con rutas
│       ├── index.css             ← Estilos globales
│       ├── components/           ← Componentes reutilizables
│       │   └── layout/
│       │       ├── Sidebar.jsx   ← Barra de navegación lateral
│       │       └── ProtectedRoute.jsx ← Protege rutas privadas
│       ├── context/
│       │   └── AuthContext.jsx   ← Estado global de autenticación
│       ├── pages/                ← Páginas de la aplicación
│       │   ├── LandingPage.jsx   ← Página de inicio (pública)
│       │   ├── LoginPage.jsx     ← Página de login
│       │   ├── RegisterPage.jsx  ← Página de registro
│       │   ├── DashboardPage.jsx ← Panel principal
│       │   ├── PetsPage.jsx      ← Gestión de mascotas
│       │   ├── AppointmentsPage.jsx ← Gestión de citas
│       │   ├── ClinicsPage.jsx   ← Clínicas y reseñas
│       │   └── NotFoundPage.jsx  ← Página 404
│       └── services/             ← Funciones para llamar al servidor
│           ├── api.js            ← Configuración base de Axios
│           ├── authService.js    ← Llamadas de autenticación
│           ├── petService.js     ← Llamadas de mascotas
│           ├── appointmentService.js ← Llamadas de citas
│           └── clinicService.js  ← Llamadas de clínicas
│
└── server/                       ← Backend (Node.js + Express)
    └── src/
        ├── server.js             ← Punto de entrada del servidor
        ├── app.js                ← Configuración de Express
        ├── config/
        │   └── database.js       ← Conexión a Supabase
        ├── controllers/          ← Lógica de negocio
        │   ├── authController.js
        │   ├── petController.js
        │   ├── appointmentController.js
        │   ├── clinicController.js
        │   └── reviewController.js
        ├── middleware/           ← Funciones intermedias
        │   ├── authMiddleware.js ← Verifica JWT
        │   ├── roleMiddleware.js ← Verifica rol de admin
        │   └── errorHandler.js  ← Manejo global de errores
        ├── routes/               ← Definición de endpoints
        │   ├── authRoutes.js
        │   ├── petRoutes.js
        │   ├── appointmentRoutes.js
        │   └── clinicRoutes.js
        └── utils/
            └── generateToken.js  ← Genera tokens JWT
```

---

## 3. Cómo funciona la aplicación (flujo general)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
│                  (abre el navegador)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
│              http://localhost:5173                              │
│                                                                 │
│  Muestra la interfaz visual, recibe acciones del usuario        │
│  y se comunica con el backend via peticiones HTTP               │
└─────────────────────┬───────────────────────────────────────────┘
                      │ peticiones HTTP (GET, POST, PUT, DELETE)
                      │ via Axios
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                            │
│              http://localhost:3001                              │
│                                                                 │
│  Recibe peticiones, verifica autenticación,                     │
│  aplica lógica de negocio y consulta/guarda datos               │
└─────────────────────┬───────────────────────────────────────────┘
                      │ consultas SQL
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (Supabase)                     │
│                   PostgreSQL en la nube                         │
│                                                                 │
│  Guarda de forma permanente: usuarios, mascotas, citas,         │
│  clínicas y reseñas                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo de flujo: el usuario agenda una cita

1. El usuario hace clic en "Nueva Cita" en `AppointmentsPage.jsx`
2. El frontend envía una petición `POST /api/appointments` con los datos
3. El backend recibe la petición en `appointmentRoutes.js`
4. `authMiddleware.js` verifica que el token JWT sea válido
5. `appointmentController.js` recibe los datos y los guarda en Supabase
6. El backend responde con la cita creada
7. El frontend muestra un mensaje de éxito (react-hot-toast)

---

## 4. El Backend (servidor)

### ¿Qué es el backend?

El backend es el "cerebro" de la aplicación. Corre en Node.js y maneja:
- La seguridad (¿quién puede hacer qué?)
- La lógica de negocio (¿cómo se crean las citas?)
- La comunicación con la base de datos

### Punto de entrada: `server/src/server.js`

Es el primer archivo que se ejecuta. Solo hace dos cosas:
1. Lee las variables de entorno (`.env`)
2. Inicia el servidor en el puerto 3001

### Configuración de Express: `server/src/app.js`

Configura el servidor Express con:
- **CORS**: permite que el frontend (localhost:5173) se comunique con el backend
- **JSON middleware**: permite recibir datos en formato JSON
- **Rutas**: conecta las URLs con los controladores

### Rutas disponibles (API Endpoints)

Las rutas definen qué URLs acepta el servidor:

#### Autenticación (`/api/auth`)
```
POST /api/auth/register  → Registrar un usuario nuevo
POST /api/auth/login     → Iniciar sesión
GET  /api/auth/me        → Ver perfil del usuario actual (requiere login)
```

#### Mascotas (`/api/pets`) — Requieren login
```
GET    /api/pets         → Ver todas mis mascotas
POST   /api/pets         → Crear una mascota nueva
GET    /api/pets/:id     → Ver una mascota específica
PUT    /api/pets/:id     → Editar una mascota
DELETE /api/pets/:id     → Eliminar una mascota
```

#### Citas (`/api/appointments`) — Requieren login
```
GET    /api/appointments         → Ver todas mis citas
POST   /api/appointments         → Crear una cita nueva
GET    /api/appointments/:id     → Ver una cita específica
PUT    /api/appointments/:id     → Editar una cita
DELETE /api/appointments/:id     → Eliminar una cita
```

#### Clínicas (`/api/clinics`)
```
GET    /api/clinics              → Ver todas las clínicas (requiere login)
GET    /api/clinics/:id          → Ver una clínica (requiere login)
POST   /api/clinics              → Crear clínica (solo admins)
PUT    /api/clinics/:id          → Editar clínica (solo admins)
DELETE /api/clinics/:id          → Eliminar clínica (solo admins)

GET    /api/clinics/:id/reviews  → Ver reseñas de una clínica (requiere login)
POST   /api/clinics/:id/reviews  → Agregar/editar reseña (requiere login)
DELETE /api/clinics/:id/reviews/:reviewId → Eliminar reseña propia
```

### Controladores

Los controladores contienen la lógica de cada operación:

#### `authController.js`
- **register()**: Valida datos, hashea la contraseña con bcrypt, guarda el usuario, retorna token JWT
- **login()**: Busca el usuario por email, compara la contraseña, retorna token JWT

#### `petController.js`
- Todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) de mascotas
- Siempre filtra por `user_id` para que cada usuario solo vea sus propias mascotas

#### `appointmentController.js`
- Gestiona citas con estado: `scheduled` (agendada), `completed` (completada), `cancelled` (cancelada)
- Al crear, el estado por defecto es `scheduled`

#### `clinicController.js`
- Calcula el promedio de calificaciones de cada clínica
- Puede obtener coordenadas automáticamente usando OpenStreetMap (geocodificación)

#### `reviewController.js`
- Un usuario solo puede tener UNA reseña por clínica
- Si ya existe una reseña del usuario para esa clínica, la actualiza

### Middleware

El middleware son funciones que se ejecutan **antes** de llegar al controlador:

#### `authMiddleware.js` — `protect()`
```
Petición → [verifica token JWT] → Controlador
                 ↓ si falla
            Error 401 (No autorizado)
```
Extrae el token del header `Authorization: Bearer <token>`, lo verifica y agrega los datos del usuario a la petición.

#### `roleMiddleware.js` — `requireAdmin()`
```
Petición autenticada → [verifica si es admin] → Controlador
                              ↓ si no es admin
                         Error 403 (Prohibido)
```

#### `errorHandler.js`
Captura cualquier error no manejado y devuelve una respuesta JSON en lugar de crashear el servidor.

---

## 5. El Frontend (interfaz visual)

### ¿Qué es el frontend?

El frontend es todo lo que ve el usuario. Es una SPA (Single Page Application), lo que significa que la página nunca se recarga completamente — React actualiza solo las partes que cambian.

### Punto de entrada: `client/src/main.jsx`

Primer archivo que ejecuta React. Monta la aplicación en el elemento `<div id="root">` del HTML.

### Enrutamiento: `client/src/App.jsx`

Define qué página se muestra según la URL:

| URL | Componente | ¿Requiere login? |
|---|---|---|
| `/` | LandingPage | No |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/dashboard` | DashboardPage | Sí |
| `/pets` | PetsPage | Sí |
| `/appointments` | AppointmentsPage | Sí |
| `/clinics` | ClinicsPage | Sí |
| `/*` (cualquier otra) | NotFoundPage | No |

Las rutas privadas están envueltas en `ProtectedRoute`, que redirige al login si no hay sesión.

### Páginas

#### `LandingPage.jsx` — Página de inicio pública
- Página de bienvenida con descripción de PetTime
- Botones para ir a Login o Registro
- No requiere autenticación

#### `LoginPage.jsx` — Inicio de sesión
- Formulario de email y contraseña
- Llama a `authService.login()`
- Si es exitoso, guarda el token y redirige al dashboard

#### `RegisterPage.jsx` — Registro
- Formulario de nombre, email y contraseña
- Validación: contraseña mínimo 6 caracteres
- Llama a `authService.register()`
- Si es exitoso, redirige al dashboard

#### `DashboardPage.jsx` — Panel principal
- Saludo al usuario con animación de huellas
- Tarjetas de acceso rápido (Mascotas, Citas, Clínicas)
- Widget de próximas citas (las siguientes 5)
- Resalta citas urgentes (dentro de 48 horas)

#### `PetsPage.jsx` — Gestión de mascotas
- Lista todas las mascotas del usuario
- Formulario para crear/editar mascotas
- Campos: nombre, especie, raza, notas, fecha de nacimiento, peso
- Especies con íconos emoji: 🐶 perro, 🐱 gato, 🐦 ave, 🐰 conejo, 🐾 otro

#### `AppointmentsPage.jsx` — Citas veterinarias
- Lista de citas con badges de estado (agendada/completada/cancelada)
- **Wizard de 3 pasos** para crear una cita:
  1. Seleccionar mascota, motivo y notas
  2. Seleccionar fecha/hora y clínica
  3. Revisar y confirmar
- Calcula distancias a clínicas usando la fórmula de Haversine (distancia geográfica)
- Motivos categorizados: consulta general, vacunación, cirugía, dermatología, etc.

#### `ClinicsPage.jsx` — Clínicas veterinarias
- Lista todas las clínicas con dirección y calificación
- Reseñas con sistema de estrellas (1 a 5)
- Usuarios pueden agregar/editar/eliminar su propia reseña
- Solo admins pueden crear/editar/eliminar clínicas

#### `NotFoundPage.jsx` — Página 404
- Página simple para URLs que no existen
- Botón para volver al inicio

### Componentes de layout

#### `Sidebar.jsx` — Barra lateral de navegación
- Siempre visible cuando el usuario está logueado
- Muestra nombre del usuario e insignia "Admin" si aplica
- Links de navegación: Dashboard, Mascotas, Citas, Clínicas
- Botón de Logout

#### `ProtectedRoute.jsx` — Protección de rutas
```jsx
// Si el usuario no está logueado → redirige a /login
// Si está verificando → muestra spinner
// Si está logueado → muestra la página solicitada
```

### Estado global: `context/AuthContext.jsx`

Es el "estado compartido" de toda la aplicación. Guarda:
- El usuario actual (`user`)
- Si está cargando (`loading`)

Provee funciones:
- `login(email, password)` — inicia sesión
- `register(name, email, password)` — registra usuario
- `logout()` — cierra sesión

Se puede usar en cualquier componente con el hook `useAuth()`:
```jsx
const { user, login, logout } = useAuth();
```

Los datos se persisten en `localStorage` con las claves:
- `pettime_token` — el token JWT
- `pettime_user` — los datos del usuario (JSON)

### Servicios (llamadas al backend)

#### `services/api.js` — Configuración base de Axios
- URL base: variable de entorno `VITE_API_URL` (por defecto `http://localhost:3001`)
- Interceptor de petición: añade automáticamente el token JWT a cada petición
- Interceptor de respuesta: si recibe un error 401, limpia el localStorage y redirige al login

#### `services/authService.js`
```javascript
register(name, email, password)  // POST /api/auth/register
login(email, password)           // POST /api/auth/login
getProfile()                     // GET /api/auth/me
```

#### `services/petService.js`
```javascript
getAll()                // GET /api/pets
getById(id)             // GET /api/pets/:id
create(petData)         // POST /api/pets
update(id, petData)     // PUT /api/pets/:id
remove(id)              // DELETE /api/pets/:id
```

#### `services/appointmentService.js`
```javascript
getAll()                         // GET /api/appointments
getById(id)                      // GET /api/appointments/:id
create(appointmentData)          // POST /api/appointments
update(id, appointmentData)      // PUT /api/appointments/:id
remove(id)                       // DELETE /api/appointments/:id
```

#### `services/clinicService.js`
```javascript
getAll()                              // GET /api/clinics
getById(id)                           // GET /api/clinics/:id
create(clinicData)                    // POST /api/clinics
update(id, clinicData)                // PUT /api/clinics/:id
remove(id)                            // DELETE /api/clinics/:id
getReviews(clinicId)                  // GET /api/clinics/:id/reviews
saveReview(clinicId, reviewData)      // POST /api/clinics/:id/reviews
deleteReview(clinicId, reviewId)      // DELETE /api/clinics/:id/reviews/:reviewId
```

---

## 6. La Base de Datos

### ¿Qué es Supabase?

Supabase es una plataforma en la nube que provee una base de datos PostgreSQL (relacional) con una API fácil de usar. Es como Firebase pero open-source.

### Tablas de la base de datos

#### Tabla `users` — Usuarios
| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| name | string | Nombre del usuario |
| email | string | Email (único) |
| password_hash | string | Contraseña cifrada con bcrypt |
| role | string | 'user' o 'admin' |
| created_at | timestamp | Fecha de registro |

#### Tabla `pets` — Mascotas
| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| user_id | UUID | Dueño (referencia a users) |
| name | string | Nombre de la mascota |
| species | string | perro, gato, ave, conejo, otro |
| breed | string | Raza |
| date_of_birth | date | Fecha de nacimiento |
| weight_kg | number | Peso en kilogramos |
| notes | text | Notas adicionales |
| created_at | timestamp | Fecha de registro |

#### Tabla `appointments` — Citas
| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| user_id | UUID | Usuario que agenda (referencia a users) |
| pet_id | UUID | Mascota de la cita (referencia a pets) |
| clinic_id | UUID | Clínica (referencia a clinics, opcional) |
| appointment_date | timestamp | Fecha y hora de la cita |
| reason | string | Motivo de la cita |
| notes | text | Notas adicionales |
| status | string | 'scheduled', 'completed', 'cancelled' |
| created_at | timestamp | Fecha de creación |

#### Tabla `clinics` — Clínicas
| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| created_by | UUID | Admin que la creó (referencia a users) |
| name | string | Nombre de la clínica |
| address | string | Dirección |
| city | string | Ciudad |
| latitude | number | Latitud geográfica |
| longitude | number | Longitud geográfica |
| created_at | timestamp | Fecha de registro |

#### Tabla `reviews` — Reseñas
| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| clinic_id | UUID | Clínica reseñada (referencia a clinics) |
| user_id | UUID | Usuario que reseñó (referencia a users) |
| rating | integer | Calificación del 1 al 5 |
| comment | text | Comentario (opcional) |
| created_at | timestamp | Fecha de la reseña |

### Relaciones entre tablas

```
users ──┬── pets (un usuario tiene muchas mascotas)
        ├── appointments (un usuario tiene muchas citas)
        ├── clinics (un admin puede crear clínicas)
        └── reviews (un usuario puede reseñar clínicas)

pets ────── appointments (una mascota tiene muchas citas)
clinics ─┬── appointments (una clínica recibe muchas citas)
         └── reviews (una clínica tiene muchas reseñas)
```

---

## 7. Autenticación y seguridad

### ¿Cómo funciona el login?

```
1. Usuario envía email + contraseña
2. Backend busca al usuario en la base de datos por email
3. Compara la contraseña con el hash guardado (bcrypt.compare)
4. Si coincide, genera un token JWT firmado con JWT_SECRET
5. El token se envía al frontend
6. El frontend guarda el token en localStorage
7. En cada petición posterior, el frontend envía: Authorization: Bearer <token>
8. El backend verifica el token con authMiddleware.js
```

### ¿Qué es un JWT (JSON Web Token)?

Un JWT es una cadena de texto que contiene información del usuario, firmada digitalmente:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.   ← Header
eyJpZCI6IjEyMyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.   ← Payload (datos)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← Firma
```

El payload contiene: `{ id, email, role }`

El token dura **30 días** antes de expirar.

### Roles de usuario

| Rol | Capacidades |
|---|---|
| `user` (por defecto) | Gestionar sus propias mascotas, citas y reseñas |
| `admin` | Todo lo de user + crear/editar/eliminar clínicas |

### Seguridad de contraseñas

Las contraseñas nunca se guardan en texto plano. Se usa bcrypt con 10 rondas de sal:
```
"miContraseña123" → "$2b$10$xyz..." (hash irreversible)
```

---

## 8. Cómo correr el proyecto

### Requisitos previos

- Node.js instalado (v18 o superior recomendado)
- Una cuenta en [Supabase](https://supabase.com) con el proyecto configurado
- Las variables de entorno configuradas

### Paso 1: Configurar variables de entorno

**Backend** (`server/.env`):
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key-aqui
JWT_SECRET=una-frase-secreta-muy-larga-y-aleatoria
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### Paso 2: Instalar dependencias

```bash
# En una terminal, instalar dependencias del backend
cd server
npm install

# En otra terminal, instalar dependencias del frontend
cd client
npm install
```

### Paso 3: Correr el proyecto

```bash
# Terminal 1 - Backend
cd server
npm run dev
# → "Servidor PetTime corriendo en http://localhost:3001"

# Terminal 2 - Frontend
cd client
npm run dev
# → "Local: http://localhost:5173"
```

### Paso 4: Abrir la aplicación

Abrir el navegador en: **http://localhost:5173**

---

## 9. Glosario de términos

| Término | Explicación |
|---|---|
| **API** | Interfaz de programación — el conjunto de URLs que el backend expone para que el frontend pueda comunicarse con él |
| **JWT** | JSON Web Token — una forma de autenticar usuarios sin guardar sesiones en el servidor |
| **Middleware** | Función que se ejecuta entre la petición y el controlador para verificar, transformar o registrar datos |
| **CRUD** | Create, Read, Update, Delete — las cuatro operaciones básicas sobre datos |
| **SPA** | Single Page Application — la página no se recarga, React actualiza solo lo necesario |
| **Hash** | Transformación irreversible de datos (como contraseñas) para guardarlos de forma segura |
| **Endpoint** | Una URL específica del servidor que acepta peticiones (ej: `/api/pets`) |
| **Controlador** | Archivo con la lógica de negocio que maneja una petición específica |
| **Ruta** | Definición de qué URL activa qué controlador |
| **Context (React)** | Mecanismo para compartir estado entre múltiples componentes sin pasarlo manualmente |
| **Hook** | Función especial de React que permite usar características como estado o efectos (useAuth, useState, etc.) |
| **UUID** | Identificador único universal — un ID aleatorio que identifica registros en la base de datos |
| **CORS** | Política de seguridad del navegador — el backend debe permitir explícitamente peticiones del frontend |
| **Token** | Cadena de texto que representa la identidad autenticada del usuario |
| **Supabase** | Plataforma de base de datos PostgreSQL en la nube, similar a Firebase |
| **Axios** | Librería de JavaScript para hacer peticiones HTTP (GET, POST, PUT, DELETE) |
| **Vite** | Herramienta para correr y compilar el frontend React muy rápidamente |
| **Tailwind CSS** | Framework CSS que usa clases utilitarias directamente en el HTML/JSX |
| **bcrypt** | Algoritmo para cifrar contraseñas de forma segura |
| **localStorage** | Almacenamiento del navegador donde el frontend guarda el token del usuario |
| **Geocodificación** | Convertir una dirección de texto en coordenadas geográficas (latitud/longitud) |
| **Haversine** | Fórmula matemática para calcular distancias entre dos puntos geográficos |

---

*Manual generado para el Proyecto Productivo 2025 — PetTime App*
