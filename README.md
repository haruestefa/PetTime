# PetTime APP

Aplicación web para la gestión de citas veterinarias en la región de Pereira y Risaralda.

## Descripción

PetTime optimiza la gestión de citas veterinarias, mejorando la experiencia de clínicas y propietarios de mascotas. Permite agendar, modificar y consultar citas en tiempo real, recibir recordatorios automáticos y acceder a historiales médicos de forma segura.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React.js + Vite |
| Estilos | Tailwind CSS |
| Navegación | React Router DOM |
| Backend | Node.js + Express |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | JWT + bcryptjs |
| Despliegue Frontend | Vercel |
| Despliegue Backend | Render |

## Estructura del Proyecto

```
PetTimeMvp/
├── client/    ← Frontend (React + Vite)
├── server/    ← Backend (Node.js + Express)
├── .gitignore
└── README.md
```

## Cómo correr el proyecto localmente

### Backend
```bash
cd server
npm install
npm run dev
# Servidor disponible en http://localhost:3001
```

### Frontend
```bash
cd client
npm install
npm run dev
# App disponible en http://localhost:5173
```

## Variables de Entorno

### Backend (`server/.env`)
```
PORT=3001
CLIENT_URL=http://localhost:5173
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_KEY=tu_service_role_key
JWT_SECRET=tu_secreto_jwt
```

### Frontend (`client/.env`)
```
VITE_API_URL=http://localhost:3001
```

## Funcionalidades del MVP

- Registro e inicio de sesión (email y contraseña)
- Gestión de mascotas (agregar, editar, eliminar)
- Agendamiento de citas veterinarias
- Consulta de citas por usuario

## Equipo

Proyecto Productivo 2025 — Pereira, Risaralda, Colombia
