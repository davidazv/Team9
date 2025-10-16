# oFRAUD API - Documentación Completa

## Información General

- **URL Base**: `http://localhost:3000`
- **Documentación Swagger**: `http://localhost:3000/api`
- **Versión**: 2.0
- **Autenticación**: Bearer Token (JWT)

## Esquema de Base de Datos

La base de datos incluye las siguientes tablas principales:
- `users` - Usuarios del sistema
- `admins` - Administradores
- `reports` - Reportes de fraude
- `help_requests` - Solicitudes de ayuda de usuarios
- `notifications` - Notificaciones del sistema
- `report_categories` - Categorías de fraude
- `report_statuses` - Estados de reportes

Para crear las tablas ejecuta: `migration_help_requests.sql`

## Autenticación

### 1. Registro de Usuario
**POST** `/users`
```json
{
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "password": "password123"
}
```

### 2. Login de Usuario
**POST** `/auth/login`
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```
**Respuesta:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### 3. Login de Admin
**POST** `/auth/admin/login`
```json
{
  "email": "admin@ofraud.com",
  "password": "admin2024"
}
```

### 4. Login con Apple
**POST** `/auth/apple/login`
```json
{
  "appleUserId": "000123.abc456def789.1234",
  "email": "usuario@privaterelay.appleid.com",
  "name": "Juan Pérez",
  "identityToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### 5. Refresh Token
**POST** `/auth/refresh`
```json
{
  "token": "refresh_token_aqui"
}
```

### 6. Obtener Perfil
**GET** `/auth/profile`
- **Headers**: `Authorization: Bearer {token}`

---

## Gestión de Reportes

### 1. Ver Reportes Públicos Aceptados
**GET** `/reports/public/accepted`
- **Sin autenticación requerida**
- **Query params opcionales**:
  - `dateFrom`: YYYY-MM-DD
  - `dateTo`: YYYY-MM-DD  
  - `categoryId`: number

**Ejemplo:**
```
GET /reports/public/accepted?categoryId=1&dateFrom=2025-09-01&dateTo=2025-09-30
```

### 2. Ver Mis Reportes
**GET** `/reports/my-reports`
- **Headers**: `Authorization: Bearer {token}`
- **Query params opcionales**:
  - `dateFrom`: YYYY-MM-DD
  - `dateTo`: YYYY-MM-DD
  - `categoryId`: number
  - `statusId`: number (1=Pendiente, 2=Aceptado, 3=Rechazado)

### 3. Crear Reporte (Usuario Autenticado)
**POST** `/reports`
- **Headers**: `Authorization: Bearer {token}`
```json
{
  "category_id": 1,
  "title": "Sitio web falso de banco",
  "description": "Encontré una página que imita al BBVA...",
  "incident_date": "2025-10-13",
  "location": "Ciudad de México",
  "evidence_url": "http://localhost:3000/public/uploads/evidence_123456789.jpg",
  "is_anonymous": false
}
```

### 4. Crear Reporte como Invitado
**POST** `/reports/guest`
- **Sin autenticación**
```json
{
  "category_id": 1,
  "title": "Sitio web falso de banco",
  "description": "Encontré una página que imita al BBVA...",
  "incident_date": "2025-10-13",
  "location": "Ciudad de México",
  "evidence_url": "http://localhost:3000/public/uploads/evidence_123456789.jpg"
}
```

### 5. Obtener Reporte por ID
**GET** `/reports/{id}`
- **Headers**: `Authorization: Bearer {token}`

### 6. Actualizar Reporte
**PUT** `/reports/{id}`
- **Headers**: `Authorization: Bearer {token}`
- Solo si el reporte está en estado "Pendiente"

### 7. Eliminar Reporte
**DELETE** `/reports/{id}`
- **Headers**: `Authorization: Bearer {token}`
- Solo si el reporte está en estado "Pendiente"

---

## Subida de Archivos

### Subir Imagen de Evidencia
**POST** `/files/upload`
- **Content-Type**: `multipart/form-data`
- **Campo**: `file` (imagen JPG, PNG, WebP, máximo 5MB)
- **Headers**: `Authorization: Bearer {token}` (opcional para invitados)

**Respuesta:**
```json
{
  "fileKey": "evidence_1697123456789_123.jpg",
  "url": "http://localhost:3000/public/uploads/evidence_1697123456789_123.jpg"
}
```

**Curl de ejemplo:**
```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@/ruta/a/imagen.jpg"
```

---

## Solicitudes de Ayuda

### 1. Crear Solicitud de Ayuda
**POST** `/help-requests`
- **Headers**: `Authorization: Bearer {token}`
```json
{
  "title": "Necesito ayuda urgente",
  "description": "Me están llamando ahora mismo del banco...",
  "priority": "urgent"
}
```
**Prioridades**: `urgent`, `normal`, `low`

### 2. Ver Mis Solicitudes de Ayuda
**GET** `/help-requests/my-requests`
- **Headers**: `Authorization: Bearer {token}`

### 3. Ver Solicitud por ID
**GET** `/help-requests/{id}`
- **Headers**: `Authorization: Bearer {token}`

### 4. Ver Todas las Solicitudes (Admin)
**GET** `/help-requests/admin/all`
- **Headers**: `Authorization: Bearer {admin_token}`

### 5. Ver Solicitudes Pendientes (Admin)
**GET** `/help-requests/admin/pending`
- **Headers**: `Authorization: Bearer {admin_token}`

### 6. Responder Solicitud (Admin)
**PATCH** `/help-requests/{id}/respond`
- **Headers**: `Authorization: Bearer {admin_token}`
```json
{
  "admin_response": "Hola, entiendo tu preocupación. Lo primero que debes hacer es...",
  "status": "resolved"
}
```
**Estados**: `pending`, `in_progress`, `resolved`, `closed`

### 7. Asignar Solicitud a Admin
**PATCH** `/help-requests/{id}/assign`
- **Headers**: `Authorization: Bearer {admin_token}`

---

## Gestión de Usuarios (Admin)

### 1. Listar Todos los Usuarios
**GET** `/admin/list`
- **Headers**: `Authorization: Bearer {admin_token}`

### 2. Obtener Usuario por ID
**GET** `/admin/{id}`
- **Headers**: `Authorization: Bearer {admin_token}`

### 3. Actualizar Usuario por ID
**PUT** `/admin/{id}`
- **Headers**: `Authorization: Bearer {admin_token}`
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com"
}
```

---

## Gestión de Perfil de Usuario

### Actualizar Mi Perfil
**PUT** `/users`
- **Headers**: `Authorization: Bearer {token}`
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com"
}
```

---

## Códigos de Respuesta

- **200**: Éxito
- **201**: Creado exitosamente
- **400**: Datos inválidos
- **401**: No autenticado
- **403**: Sin permisos
- **404**: No encontrado
- **500**: Error interno del servidor

---

## Categorías de Fraude (IDs)

1. Sitio Web Bancario Falso
2. Aplicación Bancaria Falsa
3. Phishing por Email
4. Estafa Telefónica
5. SMS Fraudulento
6. Fraude en Redes Sociales
7. Sitio de Compras Falso
8. Estafa de Inversión
9. Fraude Presencial
10. Clonación de Tarjetas

---

## Estados de Reportes (IDs)

1. Pendiente
2. Aceptado
3. Rechazado

---

## Notas Importantes

1. **Imágenes**: Las URLs de evidencia se generan automáticamente al subir archivos
2. **Reportes Anónimos**: Si `is_anonymous: true`, el nombre del usuario aparece como "Anónimo"
3. **Reportes de Invitado**: Siempre son anónimos automáticamente
4. **Notificaciones**: Se crean automáticamente cuando un admin responde a una solicitud de ayuda
5. **Archivos Estáticos**: Accesibles en `http://localhost:3000/public/uploads/`

---

## Credenciales de Prueba

### Administradores:
- **Email**: `admin@ofraud.com` | **Password**: `admin2024`
- **Email**: `supervisor@ofraud.com` | **Password**: `supervisor123`

### Usuarios:
- **Email**: `demo@example.com` | **Password**: `demo123`
- **Email**: `maria@example.com` | **Password**: `maria123`