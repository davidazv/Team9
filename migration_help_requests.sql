-- Script para agregar las tablas de solicitudes de ayuda
-- Ejecutar este script en tu base de datos existente

USE ofraud_db;

-- Crear tabla de solicitudes de ayuda
CREATE TABLE IF NOT EXISTS help_requests (
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
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_admin_id) REFERENCES admins(id)
);

-- Agregar columna help_request_id a la tabla notifications si no existe
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS help_request_id BIGINT NULL,
ADD FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_help_requests_user_id ON help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_priority ON help_requests(priority);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON help_requests(created_at);

-- Insertar datos de ejemplo
INSERT INTO help_requests (user_id, title, description, priority, status, created_at) VALUES
(1, 'Necesito ayuda urgente - Estafa en curso', 'Me están llamando ahora mismo haciéndose pasar del banco, ¿qué hago?', 'urgent', 'pending', NOW()),
(2, 'Consulta sobre reporte', 'Mi reporte fue rechazado pero tengo más evidencia', 'normal', 'pending', NOW()),
(3, 'Información general', '¿Cómo puedo protegerme mejor de estafas telefónicas?', 'low', 'pending', NOW());

SELECT 'Migración completada: Tablas de solicitudes de ayuda creadas correctamente' as resultado;