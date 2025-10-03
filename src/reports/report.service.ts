import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ReportResponseDto } from './dto/report-response.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly dbService: DbService) {}

  // ============================================
  // Obtener TODOS los reportes con filtros (sin filtrar por usuario)
  // ============================================
  async findAllWithFilters(filters?: {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: number;
    statusId?: number;
  }): Promise<ReportResponseDto[]> {
    const pool = this.dbService.getPool();
    
    let sql = 'SELECT * FROM reports WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.dateFrom) {
      sql += ' AND incident_date >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters?.dateTo) {
      sql += ' AND incident_date <= ?';
      params.push(filters.dateTo);
    }
    
    if (filters?.categoryId) {
      sql += ' AND category_id = ?';
      params.push(filters.categoryId);
    }
    
    if (filters?.statusId) {
      sql += ' AND status_id = ?';
      params.push(filters.statusId);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(sql, params);
    return (rows as any[]).map(row => this.mapToDto(row));
  }

  // ============================================
  // Obtener reportes de UN usuario específico con filtros
  // ============================================
  async findByUserId(
    userId: number, 
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      categoryId?: number;
      statusId?: number;
    }
  ): Promise<ReportResponseDto[]> {
    const pool = this.dbService.getPool();
    
    let sql = 'SELECT * FROM reports WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (filters?.dateFrom) {
      sql += ' AND incident_date >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters?.dateTo) {
      sql += ' AND incident_date <= ?';
      params.push(filters.dateTo);
    }
    
    if (filters?.categoryId) {
      sql += ' AND category_id = ?';
      params.push(filters.categoryId);
    }
    
    if (filters?.statusId) {
      sql += ' AND status_id = ?';
      params.push(filters.statusId);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(sql, params);
    return (rows as any[]).map(row => this.mapToDto(row));
  }

  // ============================================
  // Obtener todos los reportes (sin filtros) - para admin
  // ============================================
  async findAll(): Promise<ReportResponseDto[]> {
    const pool = this.dbService.getPool();
    const [rows] = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    return (rows as any[]).map(row => this.mapToDto(row));
  }

  // ============================================
  // Obtener un reporte por ID
  // ============================================
  async findById(id: number): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();
    const [rows] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    const reports = rows as any[];
    
    if (reports.length === 0) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    
    return this.mapToDto(reports[0]);
  }

  // ============================================
  // Crear un nuevo reporte
  // ============================================
  async create(userId: number, createReportDto: CreateReportDto): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();
    
    const sql = `
      INSERT INTO reports 
      (user_id, category_id, status_id, title, description, incident_date, location, evidence_url, is_anonymous) 
      VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(sql, [
      userId,
      createReportDto.category_id,
      createReportDto.title,
      createReportDto.description,
      createReportDto.incident_date || null,
      createReportDto.location || null,
      createReportDto.evidence_url || null,
      createReportDto.is_anonymous || false
    ]);
    
    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  // ============================================
  // Actualizar un reporte existente
  // ============================================
  async update(id: number, userId: number, updateReportDto: UpdateReportDto): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();
    
    // Verificar que el reporte existe y pertenece al usuario
    const report = await this.findById(id);
    if (report.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar este reporte');
    }
    
    // Verificar que el reporte esté en estado "Pendiente" (status_id = 1)
    if (report.status_id !== 1) {
      throw new ForbiddenException('Solo se pueden editar reportes en estado pendiente');
    }
    
    const setParts: string[] = [];
    const values: any[] = [];
    
    if (updateReportDto.category_id !== undefined) {
      setParts.push('category_id = ?');
      values.push(updateReportDto.category_id);
    }
    if (updateReportDto.title !== undefined) {
      setParts.push('title = ?');
      values.push(updateReportDto.title);
    }
    if (updateReportDto.description !== undefined) {
      setParts.push('description = ?');
      values.push(updateReportDto.description);
    }
    if (updateReportDto.incident_date !== undefined) {
      setParts.push('incident_date = ?');
      values.push(updateReportDto.incident_date);
    }
    if (updateReportDto.location !== undefined) {
      setParts.push('location = ?');
      values.push(updateReportDto.location);
    }
    if (updateReportDto.evidence_url !== undefined) {
      setParts.push('evidence_url = ?');
      values.push(updateReportDto.evidence_url);
    }
    
    if (setParts.length === 0) {
      return report;
    }
    
    values.push(id);
    const sql = `UPDATE reports SET ${setParts.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);
    
    return this.findById(id);
  }

  // ============================================
  // Eliminar un reporte
  // ============================================
  async delete(id: number, userId: number): Promise<void> {
    const pool = this.dbService.getPool();
    
    // Verificar que el reporte existe y pertenece al usuario
    const report = await this.findById(id);
    if (report.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este reporte');
    }
    
    // Verificar que el reporte esté en estado "Pendiente"
    if (report.status_id !== 1) {
      throw new ForbiddenException('Solo se pueden eliminar reportes en estado pendiente');
    }
    
    await pool.query('DELETE FROM reports WHERE id = ?', [id]);
  }

  // ============================================
  // Mapear filas de BD a DTO
  // ============================================
  private mapToDto(row: any): ReportResponseDto {
    return {
      id: row.id,
      user_id: row.user_id,
      category_id: row.category_id,
      status_id: row.status_id,
      title: row.title,
      description: row.description,
      incident_date: row.incident_date,
      location: row.location,
      evidence_url: row.evidence_url,
      assigned_admin_id: row.assigned_admin_id,
      is_anonymous: row.is_anonymous,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}