import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({ description: 'ID único del reporte' })
  id: number;

  @ApiProperty({ description: 'ID del usuario que creó el reporte' })
  user_id: number;

  @ApiProperty({ description: 'Nombre del usuario que creó el reporte', required: false })
  user_name?: string;

  @ApiProperty({ description: 'ID de la categoría del reporte' })
  category_id: number;

  @ApiProperty({ description: 'Nombre de la categoría', required: false })
  category_name?: string;

  @ApiProperty({ description: 'ID del estado del reporte' })
  status_id: number;

  @ApiProperty({ description: 'Nombre del estado', required: false })
  status_name?: string;

  @ApiProperty({ description: 'Título del reporte' })
  title: string;

  @ApiProperty({ description: 'Descripción detallada del reporte' })
  description: string;

  @ApiProperty({ description: 'Fecha del incidente', required: false })
  incident_date?: string;

  @ApiProperty({ description: 'Ubicación del incidente', required: false })
  location?: string;

  @ApiProperty({ description: 'URL, número, email o información de contacto del fraude', required: false })
  fraud_contact?: string;

  @ApiProperty({ description: 'URL de imagen de evidencia', required: false })
  evidence_url?: string;

  @ApiProperty({ description: 'ID del administrador asignado', required: false })
  assigned_admin_id?: number;

  @ApiProperty({ description: 'Nombre del administrador asignado', required: false })
  assigned_admin_name?: string;

  @ApiProperty({ description: 'Si el reporte es anónimo' })
  is_anonymous: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: string;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updated_at: string;
}