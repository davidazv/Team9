import { Controller, Get, Put, UseGuards, Body, Param } from "@nestjs/common"
import { ApiOperation, ApiTags, ApiBearerAuth, ApiResponse, ApiParam } from "@nestjs/swagger"
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard"
import { AdminGuard } from "src/common/guards/admin.guard"
import { UserResponseDto } from "src/users/dto/user-response.dto"
import { UpdateUserDto } from "src/users/dto/user-update.dto"
import { UserService } from "src/users/users.service"

@ApiTags("Admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly userService: UserService) {}

  @Get("list")
  @ApiOperation({ summary: "Obtener lista de todos los usuarios, solo lo puede hacer el admin" })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios obtenida exitosamente.",
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: "Token inválido o no enviado." })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado. Se requieren permisos de administrador.",
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers()
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener usuario por ID, solo lo puede hacer el admin" })
  @ApiParam({ name: "id", description: "ID del usuario", type: "number" })
  @ApiResponse({
    status: 200,
    description: "Usuario obtenido exitosamente.",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Token inválido o no enviado." })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado. Se requieren permisos de administrador.",
  })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  async getUserById(@Param("id") id: number): Promise<UserResponseDto> {
    return this.userService.getUserById(id)
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar usuario por ID, solo lo puede hacer el admin" })
  @ApiParam({ name: "id", description: "ID del usuario a actualizar", type: "number" })
  @ApiResponse({
    status: 200,
    description: "Usuario actualizado exitosamente.",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Token inválido o no enviado." })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado. Se requieren permisos de administrador.",
  })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  async updateUserById(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.userService.updateUser(id, updateUserDto)
  }
}
