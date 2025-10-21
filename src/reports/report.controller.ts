import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ReportService } from './report.service';
import { ReportResponseDto } from './dto/report-response.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ============================================
  // IMPORTANTE: Las rutas más específicas van PRIMERO
  // ============================================

  // ============================================
  // ENDPOINT PÚBLICO - Ver todos los reportes ACEPTADOS
  // ============================================
  
  @Get('public/accepted')
  @ApiOperation({ summary: 'Ver todos los reportes ACEPTADOS (sin autenticación)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Fecha desde (YYYY-MM-DD)', example: '2025-09-01' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Fecha hasta (YYYY-MM-DD)', example: '2025-09-30' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'ID de categoría de fraude', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de reportes aceptados (públicos).', type: [ReportResponseDto] })
  async findAllAcceptedReports(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<ReportResponseDto[]> {
    const filters = {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      statusId: 2, // Solo reportes ACEPTADOS
    };
    
    return await this.reportService.findAllWithFilters(filters);
  }

  // ============================================
  // ENDPOINT DE ADMIN - Ver TODOS los reportes (para admin panel)
  // ============================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver TODOS los reportes con filtros (admin panel)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Fecha desde (YYYY-MM-DD)', example: '2025-09-01' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Fecha hasta (YYYY-MM-DD)', example: '2025-09-30' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'ID de categoría de fraude', type: Number, example: 1 })
  @ApiQuery({ name: 'statusId', required: false, description: 'ID de estado (1=Pendiente, 2=Aceptado, 3=Rechazado)', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de todos los reportes (admin).', type: [ReportResponseDto] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findAllReportsAdmin(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('categoryId') categoryId?: string,
    @Query('statusId') statusId?: string,
  ): Promise<ReportResponseDto[]> {
    const filters = {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      statusId: statusId ? parseInt(statusId) : undefined,
    };

    return await this.reportService.findAllWithFilters(filters);
  }

  // ============================================
  // ENDPOINT DE USUARIO - Ver MIS reportes
  // ============================================

  @Get('my-reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver MIS reportes con filtros (requiere login)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Fecha desde (YYYY-MM-DD)', example: '2025-09-01' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Fecha hasta (YYYY-MM-DD)', example: '2025-09-30' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'ID de categoría de fraude', type: Number, example: 1 })
  @ApiQuery({ name: 'statusId', required: false, description: 'ID de estado (1=Pendiente, 2=Aceptado, 3=Rechazado)', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de mis reportes personales.', type: [ReportResponseDto] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findMyReports(
    @Req() req: AuthenticatedRequest,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('categoryId') categoryId?: string,
    @Query('statusId') statusId?: string,
  ): Promise<ReportResponseDto[]> {
    const userId = req.user.profile.id;
    
    const filters = {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      statusId: statusId ? parseInt(statusId) : undefined,
    };
    
    return await this.reportService.findByUserId(userId, filters);
  }

  // ============================================
  // CRUD DE REPORTES
  // ============================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un reporte específico por ID' })
  @ApiParam({ name: 'id', description: 'ID del reporte', type: 'number' })
  @ApiResponse({ status: 200, description: 'Reporte encontrado.', type: ReportResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado.' })
  async findOne(@Param('id') id: number): Promise<ReportResponseDto> {
    return await this.reportService.findById(id);
  }

  @Post('guest')
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: join(__dirname, '../../public/uploads'),
      filename: (req, file, cb) => {
        // Generar nombre único con timestamp
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const extension = file.originalname.split('.').pop();
        const filename = `evidence_${timestamp}_${randomNum}.${extension}`;
        cb(null, filename);
      }
    }),
    fileFilter: (req, file, cb) => {
      // Solo permitir imágenes
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WebP)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    }
  }))
  @ApiOperation({ summary: 'Crear un nuevo reporte como invitado (siempre anónimo, sin autenticación) con archivos adjuntos' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Reporte de invitado creado exitosamente.', type: ReportResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async createGuestReport(
    @Body() createReportDto: CreateReportDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<ReportResponseDto> {
    // Forzar que sea anónimo para reportes de invitado
    const guestReportDto = { ...createReportDto, is_anonymous: true };
    return await this.reportService.createGuestReportWithFiles(guestReportDto, files);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: join(__dirname, '../../public/uploads'),
      filename: (req, file, cb) => {
        // Generar nombre único con timestamp
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const extension = file.originalname.split('.').pop();
        const filename = `evidence_${timestamp}_${randomNum}.${extension}`;
        cb(null, filename);
      }
    }),
    fileFilter: (req, file, cb) => {
      // Solo permitir imágenes
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WebP)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    }
  }))
  @ApiOperation({ summary: 'Crear un nuevo reporte (puede ser anónimo) con archivos adjuntos' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Reporte creado exitosamente.', type: ReportResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createReportDto: CreateReportDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<ReportResponseDto> {
    const userId = req.user.profile.id;
    return await this.reportService.createWithFiles(userId, createReportDto, files);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un reporte como admin (sin restricciones)' })
  @ApiParam({ name: 'id', description: 'ID del reporte a actualizar', type: 'number' })
  @ApiResponse({ status: 200, description: 'Reporte actualizado.', type: ReportResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado.' })
  async updateAsAdmin(
    @Param('id') id: number,
    @Body() updateReportDto: UpdateReportDto
  ): Promise<ReportResponseDto> {
    return await this.reportService.updateAsAdmin(id, updateReportDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un reporte (solo si está pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del reporte a actualizar', type: 'number' })
  @ApiResponse({ status: 200, description: 'Reporte actualizado.', type: ReportResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'Sin permiso o reporte ya no está pendiente.' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado.' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: number,
    @Body() updateReportDto: UpdateReportDto
  ): Promise<ReportResponseDto> {
    const userId = req.user.profile.id;
    return await this.reportService.update(id, userId, updateReportDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un reporte (solo si está pendiente)' })
  @ApiParam({ name: 'id', description: 'ID del reporte a eliminar', type: 'number' })
  @ApiResponse({ status: 200, description: 'Reporte eliminado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'Sin permiso o reporte ya no está pendiente.' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado.' })
  async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: number
  ): Promise<{ message: string }> {
    const userId = req.user.profile.id;
    await this.reportService.delete(id, userId);
    return { message: 'Reporte eliminado exitosamente' };
  }
}