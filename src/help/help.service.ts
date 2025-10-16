import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateHelpRequestDto } from './dto/create-help-request.dto';
import { HelpRequestResponseDto } from './dto/help-request-response.dto';
import { RespondHelpRequestDto } from './dto/respond-help-request.dto';

@Injectable()
export class HelpService {
  constructor(private readonly dbService: DbService) {}

  // Crear nueva solicitud de ayuda
  async create(userId: number, createHelpRequestDto: CreateHelpRequestDto): Promise<HelpRequestResponseDto> {
    const pool = this.dbService.getPool();
    
    const sql = `
      INSERT INTO help_requests (user_id, title, description, priority, status) 
      VALUES (?, ?, ?, ?, 'pending')
    `;
    
    const [result] = await pool.query(sql, [
      userId,
      createHelpRequestDto.title,
      createHelpRequestDto.description,
      createHelpRequestDto.priority
    ]);
    
    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  // Obtener solicitudes del usuario
  async findByUserId(userId: number): Promise<HelpRequestResponseDto[]> {
    const pool = this.dbService.getPool();
    
    const sql = `
      SELECT 
        hr.*,
        u.name as user_name,
        a.name as assigned_admin_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN admins a ON hr.assigned_admin_id = a.id
      WHERE hr.user_id = ?
      ORDER BY 
        CASE hr.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'normal' THEN 2 
          WHEN 'low' THEN 3 
        END,
        hr.created_at DESC
    `;
    
    const [rows] = await pool.query(sql, [userId]);
    return (rows as any[]).map(row => this.mapToDto(row));
  }

  // Obtener todas las solicitudes (para admin)
  async findAll(): Promise<HelpRequestResponseDto[]> {
    const pool = this.dbService.getPool();
    
    const sql = `
      SELECT 
        hr.*,
        u.name as user_name,
        a.name as assigned_admin_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN admins a ON hr.assigned_admin_id = a.id
      ORDER BY 
        CASE hr.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'normal' THEN 2 
          WHEN 'low' THEN 3 
        END,
        hr.created_at DESC
    `;
    
    const [rows] = await pool.query(sql);
    return (rows as any[]).map(row => this.mapToDto(row));
  }

  // Obtener solicitudes pendientes (para admin)
  async findPending(): Promise<HelpRequestResponseDto[]> {
    const pool = this.dbService.getPool();
    
    const sql = `
      SELECT 
        hr.*,
        u.name as user_name,
        a.name as assigned_admin_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN admins a ON hr.assigned_admin_id = a.id
      WHERE hr.status = 'pending'
      ORDER BY 
        CASE hr.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'normal' THEN 2 
          WHEN 'low' THEN 3 
        END,
        hr.created_at DESC
    `;
    
    const [rows] = await pool.query(sql);
    return (rows as any[]).map(row => this.mapToDto(row));
  }

  // Obtener una solicitud por ID
  async findById(id: number): Promise<HelpRequestResponseDto> {
    const pool = this.dbService.getPool();
    
    const sql = `
      SELECT 
        hr.*,
        u.name as user_name,
        a.name as assigned_admin_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN admins a ON hr.assigned_admin_id = a.id
      WHERE hr.id = ?
    `;
    
    const [rows] = await pool.query(sql, [id]);
    const helpRequests = rows as any[];
    
    if (helpRequests.length === 0) {
      throw new NotFoundException(`Solicitud de ayuda con ID ${id} no encontrada`);
    }
    
    return this.mapToDto(helpRequests[0]);
  }

  // Responder a una solicitud (solo admin)
  async respond(id: number, adminId: number, respondDto: RespondHelpRequestDto): Promise<HelpRequestResponseDto> {
    const pool = this.dbService.getPool();
    
    // Verificar que la solicitud existe
    const helpRequest = await this.findById(id);
    
    const newStatus = respondDto.status || 'resolved';
    
    const sql = `
      UPDATE help_requests 
      SET admin_response = ?, status = ?, assigned_admin_id = ?, responded_at = NOW()
      WHERE id = ?
    `;
    
    await pool.query(sql, [
      respondDto.admin_response,
      newStatus,
      adminId,
      id
    ]);

    // Crear notificación para el usuario
    await this.createNotification(helpRequest.user_id, id, respondDto.admin_response);
    
    return this.findById(id);
  }

  // Asignar solicitud a admin
  async assign(id: number, adminId: number): Promise<HelpRequestResponseDto> {
    const pool = this.dbService.getPool();
    
    // Verificar que la solicitud existe
    await this.findById(id);
    
    const sql = `
      UPDATE help_requests 
      SET assigned_admin_id = ?, status = 'in_progress'
      WHERE id = ?
    `;
    
    await pool.query(sql, [adminId, id]);
    
    return this.findById(id);
  }

  // Crear notificación
  private async createNotification(userId: number, helpRequestId: number, adminResponse: string): Promise<void> {
    const pool = this.dbService.getPool();
    
    const sql = `
      INSERT INTO notifications (user_id, help_request_id, title, message, type)
      VALUES (?, ?, ?, ?, 'info')
    `;
    
    await pool.query(sql, [
      userId,
      helpRequestId,
      'Respuesta a tu solicitud de ayuda',
      `El administrador ha respondido a tu solicitud: ${adminResponse.substring(0, 100)}${adminResponse.length > 100 ? '...' : ''}`
    ]);
  }

  // Mapear filas de BD a DTO
  private mapToDto(row: any): HelpRequestResponseDto {
    return {
      id: row.id,
      user_id: row.user_id,
      user_name: row.user_name,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      admin_response: row.admin_response,
      assigned_admin_id: row.assigned_admin_id,
      assigned_admin_name: row.assigned_admin_name,
      responded_at: row.responded_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}