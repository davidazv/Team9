import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator"


export class UpdateUserDto {
  @ApiProperty({ example: "juan@example.com", required: false, description: "Nuevo email del usuario" })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ example: "Juan Pérez Actualizado", required: false, description: "Nuevo nombre del usuario" })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ example: "newpassword123", required: false, description: "Nueva contraseña del usuario" })
  @IsOptional()
  @IsString()
  @MinLength(3)
  password?: string
}
