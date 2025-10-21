import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "./token.service";
import { UserService } from "src/users/users.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiResponse, ApiTags, ApiOperation, ApiProperty } from "@nestjs/swagger";
import { DbService } from "../db/db.service";
import { hashPassword } from "../util/hash/hash.util";
import { IsString, IsEmail, IsNotEmpty } from "class-validator";

export class AppleLoginDto {
    @ApiProperty({ example: "000123.abc456def789.1234", description: "Apple User ID único" })
    @IsString()
    @IsNotEmpty()
    appleUserId: string;

    @ApiProperty({ example: "usuario@privaterelay.appleid.com", description: "Email del usuario de Apple" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "Juan Pérez", description: "Nombre completo del usuario" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...", description: "Token de identidad de Apple" })
    @IsString()
    @IsNotEmpty()
    identityToken: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly userService: UserService,
        private readonly dbService: DbService
    ){}

    @Post("login")
    @ApiOperation({ summary: 'Usuario inicia sesión para obtener access y refresh tokens.' })
    @ApiResponse({status: 201, description: 'Tokens generados correctamente.'})
    @ApiResponse({status: 401, description: 'Credenciales inálidas.'})
    async login(@Body() loginDto: {email:string, password:string}) {
        const user = await this.userService.validateUser(loginDto.email, loginDto.password);
        if (user) {
            const accessToken = await this.tokenService.generateAccessToken(user, "user");
            const refreshToken = await this.tokenService.generateRefreshToken(user, "user");
            return { access_token: accessToken, refresh_token: refreshToken };
        }
        throw new UnauthorizedException("Credenciales inválidas");
    }

    @Post("admin/login")
    @ApiOperation({ summary: 'El administrador inicia sesión para obtener access y refresh tokens.' })
    @ApiResponse({status: 201, description: 'Tokens generados correctamente.'})
    @ApiResponse({status: 401, description: 'Credenciales inválidas.'})
    async adminLogin(@Body() body: { email: string; password: string }) {
        const pool = this.dbService.getPool();
        const [rows] = await pool.query(
            'SELECT * FROM admins WHERE email = ?',
            [body.email]
        );
        const admin = (rows as any[])[0];
        
        if (!admin) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const passwordHash = hashPassword(body.password, admin.salt);

        if (passwordHash !== admin.password_hash) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const profile = {
            id: admin.id,
            email: admin.email,
            name: admin.name
        };

        const accessToken = await this.tokenService.generateAccessToken(profile, "admin");
        const refreshToken = await this.tokenService.generateRefreshToken(profile, "admin");

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            profile
        };
    }

    @Post("refresh")
    @ApiOperation({ summary: 'Refresh access and refresh tokens.' })
    @ApiResponse({status: 201, description: 'Tokens refreshed successfully.'})
    @ApiResponse({status: 401, description: 'Invalid refresh token.'})
    async refresh(@Body() refreshDto: { token: string }) {
        const payload = await this.tokenService.verifyRefreshToken(refreshDto.token);
        if (payload) {
            let profile;
            if (payload.role === "admin") {
                const pool = this.dbService.getPool();
                const [rows] = await pool.query(
                    'SELECT * FROM admins WHERE id = ?',
                    [payload.sub]
                );
                const admin = (rows as any[])[0];
                if (!admin) throw new UnauthorizedException("Admin no encontrado");
                profile = {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name
                };
            } else {
                profile = await this.userService.findById(Number(payload.sub));
                if (!profile) throw new UnauthorizedException("Usuario no encontrado");
            }
            const newAccessToken = await this.tokenService.generateAccessToken(profile, payload.role);
            return { access_token: newAccessToken };
        }
        throw new UnauthorizedException("Refresh token inválido");
    }

    @Post("apple/login")
    @ApiOperation({ summary: 'Inicio de sesión con Apple ID' })
    @ApiResponse({status: 201, description: 'Login con Apple exitoso'})
    @ApiResponse({status: 401, description: 'Token de Apple inválido'})
    async appleLogin(@Body() appleDto: AppleLoginDto) {
        // Verificar el token de Apple (en producción deberías verificar con Apple)
        // Por ahora, simulamos la verificación
        if (!appleDto.appleUserId || !appleDto.identityToken) {
            throw new UnauthorizedException("Datos de Apple incompletos");
        }

        // Buscar usuario existente por Apple ID o email
        const pool = this.dbService.getPool();
        let [userRows] = await pool.query(
            'SELECT * FROM users WHERE apple_id = ? OR email = ?',
            [appleDto.appleUserId, appleDto.email]
        );
        
        let user = (userRows as any[])[0];

        if (!user) {
            // Crear nuevo usuario con Apple ID
            const [insertResult] = await pool.query(
                'INSERT INTO users (name, email, apple_id, created_at) VALUES (?, ?, ?, NOW())',
                [appleDto.name, appleDto.email, appleDto.appleUserId]
            );
            
            const userId = (insertResult as any).insertId;
            [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
            user = (userRows as any[])[0];
        } else if (!user.apple_id) {
            // Vincular Apple ID a usuario existente
            await pool.query(
                'UPDATE users SET apple_id = ? WHERE id = ?',
                [appleDto.appleUserId, user.id]
            );
            user.apple_id = appleDto.appleUserId;
        }

        // Generar tokens
        const profile = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        const accessToken = await this.tokenService.generateAccessToken(profile, "user");
        const refreshToken = await this.tokenService.generateRefreshToken(profile, "user");

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            profile
        };
    }

    @Get("profile")
    @ApiOperation({ summary: 'Obtiene el perfil del usuario autenticado.' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({status: 201, description: 'User profile retrieved successfully.'})
    @ApiResponse({status: 401, description: 'El token es invalido o no se envio.'})
    getProfile(@Req() req: AuthenticatedRequest) {
        return { profile: req.user.profile, role: req.user.role };
    }
}