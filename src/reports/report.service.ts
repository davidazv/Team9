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
    
    let sql = `
      SELECT 
        r.*,
        u.name as user_name,
        rc.name as category_name,
        rs.name as status_name,
        a.name as assigned_admin_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN report_categories rc ON r.category_id = rc.id
      LEFT JOIN report_statuses rs ON r.status_id = rs.id
      LEFT JOIN admins a ON r.assigned_admin_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (filters?.dateFrom) {
      sql += ' AND r.incident_date >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters?.dateTo) {
      sql += ' AND r.incident_date <= ?';
      params.push(filters.dateTo);
    }
    
    if (filters?.categoryId) {
      sql += ' AND r.category_id = ?';
      params.push(filters.categoryId);
    }
    
    if (filters?.statusId) {
      sql += ' AND r.status_id = ?';
      params.push(filters.statusId);
    }
    
    sql += ' ORDER BY r.created_at DESC';
    
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
    
    const sql = `
      SELECT 
        r.*,
        u.name as user_name,
        rc.name as category_name,
        rs.name as status_name,
        a.name as assigned_admin_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN report_categories rc ON r.category_id = rc.id
      LEFT JOIN report_statuses rs ON r.status_id = rs.id
      LEFT JOIN admins a ON r.assigned_admin_id = a.id
      ORDER BY r.created_at DESC
    `;
    
    const [rows] = await pool.query(sql);
    return (rows as any[]).map(row => this.mapToDto(row));
  }

  // ============================================
  // Obtener un reporte por ID
  // ============================================
  async findById(id: number): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();
    
    const sql = `
      SELECT 
        r.*,
        u.name as user_name,
        rc.name as category_name,
        rs.name as status_name,
        a.name as assigned_admin_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN report_categories rc ON r.category_id = rc.id
      LEFT JOIN report_statuses rs ON r.status_id = rs.id
      LEFT JOIN admins a ON r.assigned_admin_id = a.id
      WHERE r.id = ?
    `;
    
    const [rows] = await pool.query(sql, [id]);
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
      (user_id, category_id, status_id, title, description, incident_date, location, fraud_contact, evidence_url, is_anonymous) 
      VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Procesar fecha para extraer solo la parte de fecha (YYYY-MM-DD)
    let incidentDate: string | null = null;
    if (createReportDto.incident_date) {
      const dateObj = new Date(createReportDto.incident_date);
      incidentDate = dateObj.toISOString().split('T')[0]; // Extraer solo YYYY-MM-DD
    }

    const [result] = await pool.query(sql, [
      userId,
      createReportDto.category_id,
      createReportDto.title,
      createReportDto.description,
      incidentDate,
      createReportDto.location || null,
      createReportDto.fraud_contact || null,
      createReportDto.evidence_url || null,
      createReportDto.is_anonymous || false
    ]);
    
    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  // ============================================
  // Crear un nuevo reporte como invitado (sin usuario)
  // ============================================
  async createGuestReport(createReportDto: CreateReportDto): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();
    
    const sql = `
      INSERT INTO reports 
      (user_id, category_id, status_id, title, description, incident_date, location, fraud_contact, evidence_url, is_anonymous) 
      VALUES (NULL, ?, 1, ?, ?, ?, ?, ?, ?, 1)
    `;
    
    // Procesar fecha para extraer solo la parte de fecha (YYYY-MM-DD)
    let incidentDate: string | null = null;
    if (createReportDto.incident_date) {
      const dateObj = new Date(createReportDto.incident_date);
      incidentDate = dateObj.toISOString().split('T')[0]; // Extraer solo YYYY-MM-DD
    }

    const [result] = await pool.query(sql, [
      createReportDto.category_id,
      createReportDto.title,
      createReportDto.description,
      incidentDate,
      createReportDto.location || null,
      createReportDto.fraud_contact || null,
      createReportDto.evidence_url || null
    ]);
    
    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  // ============================================
  // Actualizar un reporte como admin (sin restricciones)
  // ============================================
  async updateAsAdmin(id: number, updateReportDto: UpdateReportDto): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();

    // Verificar que el reporte existe
    const report = await this.findById(id);

    const setParts: string[] = [];
    const values: any[] = [];

    if (updateReportDto.category_id !== undefined) {
      setParts.push('category_id = ?');
      values.push(updateReportDto.category_id);
    }
    if (updateReportDto.status_id !== undefined) {
      setParts.push('status_id = ?');
      values.push(updateReportDto.status_id);
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
      // Convertir fecha ISO a formato MySQL (YYYY-MM-DD)
      const date = updateReportDto.incident_date
        ? new Date(updateReportDto.incident_date).toISOString().split('T')[0]
        : null;
      values.push(date);
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

    const sql = `UPDATE reports SET ${setParts.join(', ')} WHERE id = ?`;
    values.push(id);

    await pool.query(sql, values);

    return this.findById(id);
  }

  // ============================================
  // Actualizar un reporte existente (usuario normal)
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
  // NUEVOS MÉTODOS CON SOPORTE PARA ARCHIVOS
  // ============================================

  // Método privado para procesar archivos ya guardados por multer
  private async processUploadedFiles(files: Express.Multer.File[]): Promise<string[]> {
    const fileUrls: string[] = [];

    for (const file of files) {
      // Los archivos ya fueron guardados por multer diskStorage
      // Solo necesitamos crear las URLs
      const fileUrl = `http://localhost:3000/public/uploads/${file.filename}`;
      fileUrls.push(fileUrl);
    }

    return fileUrls;
  }

  // Crear reporte con archivos (usuario autenticado)
  async createWithFiles(userId: number, createReportDto: CreateReportDto, files?: Express.Multer.File[]): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();
    
    // Procesar archivos si existen
    let evidenceUrl: string | null = null;
    if (files && files.length > 0) {
      const fileUrls = await this.processUploadedFiles(files);
      evidenceUrl = fileUrls[0]; // Por ahora solo guardamos la primera imagen en evidence_url
    }
    
    const sql = `
      INSERT INTO reports 
      (user_id, category_id, status_id, title, description, incident_date, location, fraud_contact, evidence_url, is_anonymous) 
      VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Procesar fecha para extraer solo la parte de fecha (YYYY-MM-DD)
    let incidentDate: string | null = null;
    if (createReportDto.incident_date) {
      const dateObj = new Date(createReportDto.incident_date);
      incidentDate = dateObj.toISOString().split('T')[0]; // Extraer solo YYYY-MM-DD
    }

    const [result] = await pool.query(sql, [
      userId,
      createReportDto.category_id,
      createReportDto.title,
      createReportDto.description,
      incidentDate,
      createReportDto.location || null,
      createReportDto.fraud_contact || null,
      evidenceUrl,
      createReportDto.is_anonymous || false
    ]);
    
    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  // Crear reporte de invitado con archivos
  async createGuestReportWithFiles(createReportDto: CreateReportDto, files?: Express.Multer.File[]): Promise<ReportResponseDto> {
    const pool = this.dbService.getPool();
    
    // Procesar archivos si existen
    let evidenceUrl: string | null = null;
    if (files && files.length > 0) {
      const fileUrls = await this.processUploadedFiles(files);
      evidenceUrl = fileUrls[0]; // Por ahora solo guardamos la primera imagen en evidence_url
    }
    
    const sql = `
      INSERT INTO reports 
      (user_id, category_id, status_id, title, description, incident_date, location, fraud_contact, evidence_url, is_anonymous) 
      VALUES (NULL, ?, 1, ?, ?, ?, ?, ?, ?, 1)
    `;
    
    // Procesar fecha para extraer solo la parte de fecha (YYYY-MM-DD)
    let incidentDate: string | null = null;
    if (createReportDto.incident_date) {
      const dateObj = new Date(createReportDto.incident_date);
      incidentDate = dateObj.toISOString().split('T')[0]; // Extraer solo YYYY-MM-DD
    }

    const [result] = await pool.query(sql, [
      createReportDto.category_id,
      createReportDto.title,
      createReportDto.description,
      incidentDate,
      createReportDto.location || null,
      createReportDto.fraud_contact || null,
      evidenceUrl
    ]);
    
    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  // ============================================
  // Mapear filas de BD a DTO
  // ============================================
  private mapToDto(row: any): ReportResponseDto {
    return {
      id: row.id,
      user_id: row.user_id,
      user_name: row.is_anonymous ? 'Anónimo' : row.user_name,
      category_id: row.category_id,
      category_name: row.category_name,
      status_id: row.status_id,
      status_name: row.status_name,
      title: row.title,
      description: row.description,
      incident_date: row.incident_date,
      location: row.location,
      fraud_contact: row.fraud_contact,
      evidence_url: row.evidence_url,
      assigned_admin_id: row.assigned_admin_id,
      assigned_admin_name: row.assigned_admin_name,
      is_anonymous: row.is_anonymous,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}