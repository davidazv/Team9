import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la categoría del reporte',
  })
  category_id: number;

  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @ApiProperty({ 
    example: 'Sitio web fraudulento de banco', 
    description: 'Título breve del reporte',
  })
  title: string;

  @IsString()
  @MinLength(20)
  @ApiProperty({ 
    example: 'Encontré un sitio web que imita la página de mi banco y solicita credenciales', 
    description: 'Descripción detallada del incidente'
  })
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: '2025-09-25', 
    description: 'Fecha en que ocurrió el incidente (YYYY-MM-DD)',
    required: false
  })
  incident_date?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'Ciudad de México, CDMX', 
    description: 'Ubicación física donde ocurrió el incidente',
    required: false
  })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'https://sitio-falso.com o +52 55 1234 5678', 
    description: 'URL, número telefónico, email o información de contacto del fraude',
    required: false
  })
  fraud_contact?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'http://localhost:3000/public/uploads/evidencia.png', 
    description: 'URL de la imagen de evidencia',
    required: false
  })
  evidence_url?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({ 
    example: false, 
    description: 'Si el reporte es anónimo o no',
    default: false,
    required: false
  })
  is_anonymous?: boolean;
}