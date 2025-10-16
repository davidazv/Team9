# RESUMEN DE ENDPOINTS - oFRAUD API

## 🔐 AUTENTICACIÓN

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/users` | Registrar usuario | ❌ |
| POST | `/auth/login` | Login usuario | ❌ |
| POST | `/auth/admin/login` | Login admin | ❌ |
| POST | `/auth/apple/login` | Login con Apple ID | ❌ |
| POST | `/auth/refresh` | Renovar token | ❌ |
| GET | `/auth/profile` | Obtener perfil | ✅ Usuario |

## 📋 REPORTES

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/reports/public/accepted` | Ver reportes públicos aceptados | ❌ |
| GET | `/reports/my-reports` | Ver mis reportes | ✅ Usuario |
| GET | `/reports/:id` | Obtener reporte por ID | ✅ Usuario |
| POST | `/reports` | Crear reporte (usuario) | ✅ Usuario |
| POST | `/reports/guest` | Crear reporte (invitado) | ❌ |
| PUT | `/reports/:id` | Actualizar reporte | ✅ Usuario |
| DELETE | `/reports/:id` | Eliminar reporte | ✅ Usuario |

## 🆘 SOLICITUDES DE AYUDA

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/help-requests` | Crear solicitud de ayuda | ✅ Usuario |
| GET | `/help-requests/my-requests` | Ver mis solicitudes | ✅ Usuario |
| GET | `/help-requests/:id` | Ver solicitud por ID | ✅ Usuario |
| GET | `/help-requests/admin/all` | Ver todas (admin) | ✅ Admin |
| GET | `/help-requests/admin/pending` | Ver pendientes (admin) | ✅ Admin |
| PATCH | `/help-requests/:id/respond` | Responder solicitud | ✅ Admin |
| PATCH | `/help-requests/:id/assign` | Asignar a admin | ✅ Admin |

## 📁 ARCHIVOS

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/files/upload` | Subir imagen de evidencia | 🔄 Opcional |

## 👥 GESTIÓN DE USUARIOS

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| PUT | `/users` | Actualizar mi perfil | ✅ Usuario |
| GET | `/admin/list` | Listar usuarios (admin) | ✅ Admin |
| GET | `/admin/:id` | Ver usuario por ID (admin) | ✅ Admin |
| PUT | `/admin/:id` | Actualizar usuario (admin) | ✅ Admin |

---

## 📊 QUERY PARAMETERS DISPONIBLES

### Reportes:
- `categoryId` (number): Filtrar por categoría
- `statusId` (number): Filtrar por estado (1=Pendiente, 2=Aceptado, 3=Rechazado)
- `dateFrom` (YYYY-MM-DD): Fecha desde
- `dateTo` (YYYY-MM-DD): Fecha hasta

---

## 🏷️ CATEGORÍAS DE FRAUDE

| ID | Nombre | Tipo |
|----|--------|------|
| 1 | Sitio Web Bancario Falso | url |
| 2 | Aplicación Bancaria Falsa | app |
| 3 | Phishing por Email | email |
| 4 | Estafa Telefónica | telefono |
| 5 | SMS Fraudulento | telefono |
| 6 | Fraude en Redes Sociales | app |
| 7 | Sitio de Compras Falso | url |
| 8 | Estafa de Inversión | url |
| 9 | Fraude Presencial | presencial |
| 10 | Clonación de Tarjetas | presencial |

---

## 📊 ESTADOS DE REPORTES

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | Pendiente | En espera de revisión |
| 2 | Aceptado | En proceso de investigación |
| 3 | Rechazado | Información insuficiente |

---

## 🚨 PRIORIDADES DE AYUDA

| Valor | Descripción |
|-------|-------------|
| urgent | Requiere atención inmediata |
| normal | Prioridad estándar |
| low | Baja prioridad |

---

## 📝 FORMATOS DE REQUEST

### Crear Reporte:
```json
{
  "category_id": 1,
  "title": "Título del reporte",
  "description": "Descripción detallada",
  "incident_date": "2025-10-13",
  "location": "Ubicación física",
  "evidence_url": "URL de imagen subida",
  "is_anonymous": false
}
```

### Crear Solicitud de Ayuda:
```json
{
  "title": "Título de la solicitud",
  "description": "Descripción del problema",
  "priority": "urgent|normal|low"
}
```

### Responder Solicitud (Admin):
```json
{
  "admin_response": "Respuesta del administrador",
  "status": "pending|in_progress|resolved|closed"
}
```

---

## 🔗 URLs IMPORTANTES

- **API Base**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Archivos Estáticos**: http://localhost:3000/public/uploads/

---

## 🔑 CREDENCIALES DE PRUEBA

### Admins:
- admin@ofraud.com / admin2024
- supervisor@ofraud.com / supervisor123

### Usuarios:
- demo@example.com / demo123
- maria@example.com / maria123