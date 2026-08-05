# Academia Creativa — Backend API

REST API construida con Node.js, Express y MongoDB para el Sistema de Gestión de Academia Creativa.

## Tecnologías
- **Node.js** + **Express.js** — servidor y rutas
- **MongoDB** + **Mongoose** — base de datos y modelos
- **JWT** — autenticación por tokens
- **Bcrypt** — hash de contraseñas
- **Multer** — subida de comprobantes de pago

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cp .env.example .env
# Editar .env con tu MONGO_URI y JWT_SECRET

# 3. Poblar base de datos con datos de prueba
npm run seed

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. O producción
npm start
```

---

## Estructura del proyecto

```
src/
├── server.js              # Punto de entrada
├── config/
│   └── db.js              # Conexión a MongoDB
├── models/
│   ├── Usuario.js         # Roles: admin, recepcion, profesor, tutor
│   ├── Estudiante.js      # Datos del estudiante + tutor
│   ├── Clase.js           # Clases, horarios, cupos
│   ├── Pago.js            # Pagos y comprobantes
│   └── Asistencia.js      # Registro de asistencia por sesión
├── controllers/
│   ├── authController.js
│   ├── estudiantesController.js
│   ├── clasesController.js
│   ├── pagosController.js
│   └── reportesController.js
├── middleware/
│   ├── auth.js            # JWT + autorización por rol
│   └── upload.js          # Multer para comprobantes
└── routes/
    ├── auth.js
    └── index.js           # Todas las rutas API
```

---

## Endpoints

### Autenticación
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Público | Iniciar sesión |
| GET | `/api/auth/perfil` | Todos | Ver perfil propio |
| PUT | `/api/auth/cambiar-password` | Todos | Cambiar contraseña |
| POST | `/api/auth/usuarios` | Admin | Crear usuario |

### Estudiantes
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/estudiantes` | Todos |
| POST | `/api/estudiantes` | Admin, Recepción |
| GET | `/api/estudiantes/:id` | Todos |
| PUT | `/api/estudiantes/:id` | Admin, Recepción |
| POST | `/api/estudiantes/:id/inscribir` | Admin, Recepción |
| DELETE | `/api/estudiantes/:id` | Admin |

### Clases
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/clases` | Todos |
| POST | `/api/clases` | Admin |
| GET | `/api/clases/:id` | Todos |
| PUT | `/api/clases/:id` | Admin, Recepción |
| POST | `/api/clases/:id/asistencia` | Admin, Recepción, Profesor |
| GET | `/api/clases/:id/asistencia` | Todos |

### Pagos y Mensualidades
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/pagos` | Todos (tutores ven solo los suyos) |
| POST | `/api/pagos` | Admin, Recepción |
| POST | `/api/pagos/:id/comprobante` | Todos |
| PUT | `/api/pagos/:id/validar` | Admin, Recepción |
| GET | `/api/mensualidades` | Admin, Recepción |

### Reportes
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/reportes/dashboard` | Admin, Recepción |
| GET | `/api/reportes/financiero` | Admin |
| GET | `/api/reportes/asistencia` | Admin, Recepción, Profesor |
| GET | `/api/reportes/morosidad` | Admin, Recepción |

---

## Roles y permisos

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso total |
| `recepcion` | Gestión de estudiantes, pagos, validación de comprobantes |
| `profesor` | Ver sus clases, registrar asistencia, ver reportes de sus clases |
| `tutor` | Ver datos de sus estudiantes, subir comprobantes |

---

## Flujo de pago

```
1. Tutor sube comprobante  →  estado: comprobante_enviado
2. Admin/Recepción valida  →  estado: aprobado / rechazado
3. Pago en efectivo        →  confirmado directamente por Admin/Recepción
```

---

## Credenciales de prueba (seed)

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@academia.com | Admin123! |
| Recepción | recepcion@academia.com | Admin123! |
| Profesora | garcia@academia.com | Profe123! |
