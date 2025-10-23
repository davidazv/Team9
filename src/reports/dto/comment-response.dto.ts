import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ description: 'ID único del comentario' })
  id: number;

  @ApiProperty({ description: 'ID del reporte al que pertenece el comentario' })
  report_id: number;

  @ApiProperty({ description: 'ID del administrador que creó el comentario' })
  admin_id: number;

  @ApiProperty({ description: 'Nombre del administrador que creó el comentario', required: false })
  admin_name?: string;

  @ApiProperty({ description: 'Texto del comentario' })
  comment: string;

  @ApiProperty({ description: 'Si es true, el comentario solo lo ven otros admins' })
  is_internal: boolean;

  @ApiProperty({ description: 'Fecha de creación del comentario' })
  created_at: string;

  @ApiProperty({ description: 'Fecha de última actualización del comentario' })
  updated_at: string;
}