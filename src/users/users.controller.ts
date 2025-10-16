import { Body, Controller, Post, Put, UseGuards } from "@nestjs/common";
import { UserService } from "./users.service";
import { ApiOperation, ApiProperty, ApiTags, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard"
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request"
import { UserResponseDto } from "./dto/user-response.dto"
import { UpdateUserDto } from "./dto/user-update.dto"
import { Req } from "@nestjs/common";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto  {
    @ApiProperty({example:"juan@example.com", required:true})
    @IsEmail()
    email: string;
    
    @ApiProperty({example:"Juan Perez", required:false})
    @IsString()
    @IsOptional()
    name: string;
    
    @ApiProperty({example:"password123", required:true})
    @IsString()
    @MinLength(3)
    password: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({summary: "Endpoint de registro de usuarios"})
    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(
            createUserDto.email,
            createUserDto.name,
            createUserDto.password,
        );
    }
    @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Actualizar perfil del usuario autenticado" })
  @ApiResponse({
    status: 200,
    description: "Usuario actualizado exitosamente.",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Token inválido o no enviado." })
  @ApiResponse({ status: 404, description: "Usuario no encontrado." })
  async updateOwnProfile(@Req() req: AuthenticatedRequest, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const userId = req.user.profile.id
    return this.userService.updateUser(userId, updateUserDto)
  }
}