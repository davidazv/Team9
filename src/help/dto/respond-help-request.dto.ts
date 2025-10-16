import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HelpRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export class RespondHelpRequestDto {
  @ApiProperty({
    description: 'Respuesta del administrador',
    example: 'Hola, entiendo tu preocupación. Lo primero que debes hacer es colgar inmediatamente...'
  })
  @IsString()
  @IsNotEmpty()
  admin_response: string;

  @ApiProperty({
    description: 'Nuevo estado de la solicitud',
    enum: HelpRequestStatus,
    example: HelpRequestStatus.RESOLVED,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestStatus)
  status?: HelpRequestStatus;
}