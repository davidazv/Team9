import { ApiProperty } from "@nestjs/swagger"

export class UserResponseDto {
  @ApiProperty({ example: 1, description: "ID único del usuario" })
  id: number

  @ApiProperty({ example: "juan@example.com", description: "Email del usuario" })
  email: string

  @ApiProperty({ example: "Juan Pérez", description: "Nombre completo del usuario" })
  name: string
}
