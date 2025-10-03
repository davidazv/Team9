import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserDto {
  @ApiProperty({ example: "juan@example.com", required: false, description: "Nuevo email del usuario" })
  email?: string

  @ApiProperty({ example: "Juan Pérez Actualizado", required: false, description: "Nuevo nombre del usuario" })
  name?: string

  @ApiProperty({ example: "newpassword123", required: false, description: "Nueva contraseña del usuario" })
  password?: string
}
