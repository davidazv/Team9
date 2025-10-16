import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Priority {
  URGENT = 'urgent',
  NORMAL = 'normal',
  LOW = 'low'
}

export class CreateHelpRequestDto {
  @ApiProperty({
    description: 'Título de la solicitud de ayuda',
    example: 'Necesito ayuda urgente - Estafa en curso'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Descripción detallada del problema',
    example: 'Me están llamando ahora mismo haciéndose pasar del banco, ¿qué hago?'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Prioridad de la solicitud',
    enum: Priority,
    example: Priority.URGENT,
    required: false,
    default: Priority.NORMAL
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority = Priority.NORMAL;
}