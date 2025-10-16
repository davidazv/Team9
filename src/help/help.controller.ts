import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HelpService } from './help.service';
import { CreateHelpRequestDto } from './dto/create-help-request.dto';
import { HelpRequestResponseDto } from './dto/help-request-response.dto';
import { RespondHelpRequestDto } from './dto/respond-help-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('help-requests')
@Controller('help-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva solicitud de ayuda' })
  @ApiResponse({ 
    status: 201, 
    description: 'Solicitud de ayuda creada exitosamente',
    type: HelpRequestResponseDto 
  })
  async create(
    @Request() req,
    @Body() createHelpRequestDto: CreateHelpRequestDto
  ): Promise<HelpRequestResponseDto> {
    return this.helpService.create(req.user.userId, createHelpRequestDto);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Obtener mis solicitudes de ayuda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de solicitudes del usuario',
    type: [HelpRequestResponseDto] 
  })
  async getMyRequests(@Request() req): Promise<HelpRequestResponseDto[]> {
    return this.helpService.findByUserId(req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Obtener todas las solicitudes (Admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de todas las solicitudes',
    type: [HelpRequestResponseDto] 
  })
  async getAllRequests(): Promise<HelpRequestResponseDto[]> {
    return this.helpService.findAll();
  }

  @Get('admin/pending')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Obtener solicitudes pendientes (Admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de solicitudes pendientes',
    type: [HelpRequestResponseDto] 
  })
  async getPendingRequests(): Promise<HelpRequestResponseDto[]> {
    return this.helpService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalle de la solicitud',
    type: HelpRequestResponseDto 
  })
  async getRequest(@Param('id', ParseIntPipe) id: number): Promise<HelpRequestResponseDto> {
    return this.helpService.findById(id);
  }

  @Patch(':id/respond')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Responder a solicitud de ayuda (Admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta enviada exitosamente',
    type: HelpRequestResponseDto 
  })
  async respondToRequest(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() respondDto: RespondHelpRequestDto
  ): Promise<HelpRequestResponseDto> {
    return this.helpService.respond(id, req.user.userId, respondDto);
  }

  @Patch(':id/assign')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Asignar solicitud a admin (Admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitud asignada exitosamente',
    type: HelpRequestResponseDto 
  })
  async assignRequest(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<HelpRequestResponseDto> {
    return this.helpService.assign(id, req.user.userId);
  }
}