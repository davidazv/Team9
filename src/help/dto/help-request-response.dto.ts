import { ApiProperty } from '@nestjs/swagger';

export class HelpRequestResponseDto {
  @ApiProperty({ description: 'ID único de la solicitud' })
  id: number;

  @ApiProperty({ description: 'ID del usuario que hizo la solicitud' })
  user_id: number;

  @ApiProperty({ description: 'Nombre del usuario que hizo la solicitud' })
  user_name?: string;

  @ApiProperty({ description: 'Título de la solicitud' })
  title: string;

  @ApiProperty({ description: 'Descripción del problema' })
  description: string;

  @ApiProperty({ 
    description: 'Prioridad de la solicitud',
    enum: ['urgent', 'normal', 'low']
  })
  priority: string;

  @ApiProperty({ 
    description: 'Estado de la solicitud',
    enum: ['pending', 'in_progress', 'resolved', 'closed']
  })
  status: string;

  @ApiProperty({ description: 'Respuesta del administrador', required: false })
  admin_response?: string;

  @ApiProperty({ description: 'ID del admin asignado', required: false })
  assigned_admin_id?: number;

  @ApiProperty({ description: 'Nombre del admin asignado', required: false })
  assigned_admin_name?: string;

  @ApiProperty({ description: 'Fecha de respuesta', required: false })
  responded_at?: Date;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updated_at: Date;
}