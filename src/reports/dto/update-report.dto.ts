import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReportDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la categoría del reporte',
    required: false
  })
  category_id?: number;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @ApiProperty({ 
    example: 'Sitio web fraudulento de banco (actualizado)', 
    description: 'Título breve del reporte',
    required: false
  })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @ApiProperty({ 
    example: 'Descripción actualizada del incidente', 
    description: 'Descripción detallada del incidente',
    required: false
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: '2025-09-25', 
    description: 'Fecha en que ocurrió el incidente',
    required: false
  })
  incident_date?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'Ciudad de México, CDMX', 
    description: 'Ubicación donde ocurrió el incidente',
    required: false
  })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'http://localhost:3000/public/uploads/nueva-evidencia.png', 
    description: 'URL de la imagen de evidencia',
    required: false
  })
  evidence_url?: string;
}