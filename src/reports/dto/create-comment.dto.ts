import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Texto del comentario' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ 
    description: 'Si es true, el comentario solo lo ven otros admins. Si es false, puede verlo el usuario del reporte',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  is_internal?: boolean = false;
}