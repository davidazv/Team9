-- ===================================================================
-- BASE DE DATOS COMPLETA PARA EL SISTEMA oFRAUD
-- Version: 2.1 - Con campo fraud_contact separado de location
-- ===================================================================
-- 
-- CAMBIOS EN ESTA VERSIÓN:
-- 1. Agregado campo 'fraud_contact' a la tabla reports para separar
--    información de contacto del fraude (URL, número, email) de la
--    ubicación física del incidente
-- 2. Actualizados los datos de ejemplo para usar el nuevo campo
-- 3. Campo location ahora es exclusivamente para ubicación física
-- 
-- ===================================================================

CREATE DATABASE IF NOT EXISTS ofraud_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ofraud_db;

-- Tabla de usuarios
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    apple_id VARCHAR(255) UNIQUE NULL COMMENT 'Apple ID para login con Apple',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de administradores
CREATE TABLE admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de categorías de reportes
CREATE TABLE report_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL COMMENT 'url, app, telefono, email, presencial',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estados de reportes
CREATE TABLE report_statuses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT 'pendiente, aceptado, rechazado',
    description TEXT,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal de reportes
CREATE TABLE reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL COMMENT 'NULL para reportes de invitados',
    category_id BIGINT NOT NULL,
    status_id BIGINT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_date DATE,
    location VARCHAR(255) COMMENT 'Ubicación física del incidente',
    fraud_contact VARCHAR(500) COMMENT 'URL, número telefónico o email del fraude',
    evidence_url VARCHAR(500) COMMENT 'URL de la imagen de evidencia subida',
    assigned_admin_id BIGINT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES report_categories(id),
    FOREIGN KEY (status_id) REFERENCES report_statuses(id),
    FOREIGN KEY (assigned_admin_id) REFERENCES admins(id)
);

-- NUEVA: Tabla de solicitudes de ayuda
CREATE TABLE help_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT 'urgent, normal, low',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, in_progress, resolved, closed',
    admin_response TEXT,
    assigned_admin_id BIGINT,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_admin_id) REFERENCES admins(id)
);

-- Tabla de comentarios en reportes (solo para admins)
CREATE TABLE report_comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE COMMENT 'Para comentarios solo visibles entre admins',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Tabla de historial de cambios de estado
CREATE TABLE report_status_histories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_id BIGINT NOT NULL,
    previous_status_id BIGINT,
    new_status_id BIGINT NOT NULL,
    changed_by_admin_id BIGINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (previous_status_id) REFERENCES report_statuses(id),
    FOREIGN KEY (new_status_id) REFERENCES report_statuses(id),
    FOREIGN KEY (changed_by_admin_id) REFERENCES admins(id)
);

-- Tabla de notificaciones (ACTUALIZADA para incluir help_requests)
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    report_id BIGINT NULL,
    help_request_id BIGINT NULL COMMENT 'NUEVA: Para notificaciones de solicitudes de ayuda',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' COMMENT 'info, success, warning, error',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE
);

-- ===================================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ===================================================================

-- Índices existentes
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_category_id ON reports(category_id);
CREATE INDEX idx_reports_status_id ON reports(status_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_apple_id ON users(apple_id);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_report_comments_report_id ON report_comments(report_id);

-- NUEVOS: Índices para solicitudes de ayuda
CREATE INDEX idx_help_requests_user_id ON help_requests(user_id);
CREATE INDEX idx_help_requests_priority ON help_requests(priority);
CREATE INDEX idx_help_requests_status ON help_requests(status);
CREATE INDEX idx_help_requests_created_at ON help_requests(created_at);
CREATE INDEX idx_help_requests_assigned_admin ON help_requests(assigned_admin_id);
CREATE INDEX idx_notifications_help_request_id ON notifications(help_request_id);

-- ===================================================================
-- DATOS INICIALES
-- ===================================================================

-- Estados de reportes (3 estados esenciales) 
INSERT INTO report_statuses (name, description, deleted) VALUES
('Pendiente', 'Reporte en espera de revisión por parte del administrador', FALSE),
('Aceptado', 'Reporte aceptado y en proceso de investigación', FALSE),
('Rechazado', 'Reporte rechazado por información insuficiente o no válida', FALSE);

-- Categorías de reportes con diferentes tipos
INSERT INTO report_categories (name, description, type) VALUES
('Sitio Web Bancario Falso', 'Páginas web que imitan sitios de bancos para robar credenciales', 'url'),
('Aplicación Bancaria Falsa', 'Apps móviles maliciosas que imitan aplicaciones bancarias', 'app'),
('Phishing por Email', 'Correos electrónicos fraudulentos que solicitan información personal', 'email'),
('Estafa Telefónica', 'Llamadas fraudulentas haciéndose pasar por entidades financieras', 'telefono'),
('SMS Fraudulento', 'Mensajes de texto con enlaces maliciosos o solicitudes de información', 'telefono'),
('Fraude en Redes Sociales', 'Estafas a través de plataformas como Facebook, Instagram, WhatsApp', 'app'),
('Sitio de Compras Falso', 'Tiendas online fraudulentas que no entregan productos', 'url'),
('Estafa de Inversión', 'Esquemas fraudulentos de inversión o trading', 'url'),
('Fraude Presencial', 'Estafas realizadas en persona, como falsos funcionarios', 'presencial'),
('Clonación de Tarjetas', 'Dispositivos para copiar información de tarjetas de crédito/débito', 'presencial');

-- Administradores con hash SHA-256
INSERT INTO admins (name, email, password_hash, salt) VALUES
('Carlos Martínez', 'admin@ofraud.com', SHA2(CONCAT('admin2024', 'salt123'), 256), 'salt123'),
('Ana García', 'supervisor@ofraud.com', SHA2(CONCAT('supervisor123', 'salt123'), 256), 'salt123'),
('Miguel Torres', 'soporte@ofraud.com', SHA2(CONCAT('soporte456', 'salt123'), 256), 'salt123');

-- Usuarios de prueba con hash SHA-256
INSERT INTO users (name, email, password_hash, salt) VALUES
('Usuario Demo', 'demo@example.com', SHA2(CONCAT('demo123', 'salt123'), 256), 'salt123'),
('María Pérez', 'maria@example.com', SHA2(CONCAT('maria123', 'salt789'), 256), 'salt789'),
('José López', 'jose@example.com', SHA2(CONCAT('jose456', 'salt456'), 256), 'salt456');

-- Reportes de ejemplo (ACTUALIZADO con fraud_contact)
INSERT INTO reports (user_id, category_id, status_id, title, description, incident_date, location, fraud_contact, evidence_url, is_anonymous, assigned_admin_id, created_at)
VALUES
(1, 1, 2, 'Sitio falso de Banco BBVA',
'Página clonada que solicita credenciales y código OTP', 
'2025-09-25', 'Ciudad de México', 'https://bbva-fake.com.mx', 'http://localhost:3000/public/uploads/evidence_001.jpg', FALSE, 1, '2025-09-25 10:00:00'),

(2, 3, 1, 'Email de phishing bancario Santander',
'Correo solicitando actualización de datos personales con enlace sospechoso', 
'2025-09-26', 'Guadalajara', 'noreply-santander@fakeemail.com', NULL, TRUE, NULL, '2025-09-26 14:30:00'),

(3, 4, 2, 'Llamada fraudulenta de Banamex',
'Llamada pidiendo PIN de tarjeta bajo pretexto de actualización', 
'2025-09-27', 'Monterrey', '+52 55 1234 5678', NULL, FALSE, 2, '2025-09-27 09:15:00'),

(1, 5, 1, 'SMS falso de HSBC',
'Mensaje con link para "verificar cuenta" después de supuesto cargo sospechoso',
'2025-09-28', 'Ciudad de México', '+52 55 9876 5432', NULL, FALSE, NULL, '2025-09-28 16:45:00'),

(NULL, 7, 3, 'Tienda online fraudulenta',
'Sitio que ofrece productos Apple a precio muy bajo pero nunca entrega',
'2025-09-20', 'Puebla', 'https://apple-deals-fake.com', NULL, TRUE, 1, '2025-09-20 11:20:00');

-- NUEVOS: Solicitudes de ayuda de ejemplo
INSERT INTO help_requests (user_id, title, description, priority, status, assigned_admin_id, admin_response, responded_at, created_at) VALUES
(1, 'Necesito ayuda urgente - Estafa en curso', 'Me están llamando ahora mismo haciéndose pasar del banco, ¿qué hago?', 'urgent', 'resolved', 1, 'Hola, cuelga inmediatamente y no proporciones ninguna información. Los bancos nunca piden datos por teléfono.', NOW(), '2025-10-13 10:00:00'),
(2, 'Consulta sobre reporte rechazado', 'Mi reporte fue rechazado pero tengo más evidencia', 'normal', 'in_progress', 2, NULL, NULL, '2025-10-13 11:30:00'),
(3, 'Información general sobre protección', '¿Cómo puedo protegerme mejor de estafas telefónicas?', 'low', 'pending', NULL, NULL, NULL, '2025-10-13 12:00:00');

-- Comentarios de administradores
INSERT INTO report_comments (report_id, admin_id, comment, is_internal) VALUES
(1, 1, 'Se verificó el dominio en listas negras. Coincide con patrón conocido.', TRUE),
(1, 1, 'Estamos coordinando con el banco para bloquear el sitio.', FALSE),
(3, 2, 'Número reportado a autoridades. Se detectó uso de VoIP.', FALSE),
(5, 1, 'Reporte rechazado: la tienda tiene quejas pero no es fraude confirmado.', FALSE);

-- Historial de cambios de estado
INSERT INTO report_status_histories (report_id, previous_status_id, new_status_id, changed_by_admin_id, comment) VALUES
(1, 1, 2, 1, 'Aceptado tras verificación del dominio en bases de phishing'),
(3, 1, 2, 2, 'Evidencia suficiente. Número denunciado a Condusef'),
(5, 1, 3, 1, 'No hay evidencia suficiente de fraude. Solo quejas de servicio lento.');

-- Notificaciones a usuarios (reportes y solicitudes de ayuda)
INSERT INTO notifications (user_id, report_id, help_request_id, title, message, type) VALUES
(1, 1, NULL, 'Reporte aceptado', 'Tu reporte sobre sitio falso de BBVA está siendo investigado. Te mantendremos informado.', 'success'),
(3, 3, NULL, 'Reporte aceptado', 'Hemos escalado tu caso a las autoridades correspondientes.', 'success'),
(2, 5, NULL, 'Reporte rechazado', 'Después de revisar tu reporte, no encontramos evidencia suficiente de fraude.', 'warning'),
(1, NULL, 1, 'Respuesta a tu solicitud de ayuda', 'El administrador ha respondido a tu solicitud: Hola, cuelga inmediatamente y no proporciones ninguna información...', 'info');

-- ===================================================================
-- VERIFICACIÓN DE INSTALACIÓN
-- ===================================================================

SELECT 'Base de datos oFRAUD v2.0 instalada correctamente' as resultado;
SELECT 'Tablas creadas:' as info;
SELECT TABLE_NAME as tabla FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'ofraud_db' ORDER BY TABLE_NAME;

-- ===================================================================
-- COMANDOS ÚTILES PARA DESARROLLO
-- ===================================================================

/*
-- Para resetear la base de datos:
DROP DATABASE IF EXISTS ofraud_db;

-- Para ver el estado de las tablas:
SHOW TABLE STATUS FROM ofraud_db;

-- Para verificar datos de ejemplo:
SELECT 'Usuarios:' as tipo, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Admins:', COUNT(*) FROM admins
UNION ALL
SELECT 'Reportes:', COUNT(*) FROM reports
UNION ALL
SELECT 'Solicitudes de ayuda:', COUNT(*) FROM help_requests
UNION ALL
SELECT 'Notificaciones:', COUNT(*) FROM notifications;
*/