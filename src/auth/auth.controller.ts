import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "./token.service";
import { UserService } from "src/users/users.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiResponse, ApiTags, ApiOperation } from "@nestjs/swagger";
import { DbService } from "../db/db.service";
import { hashPassword } from "../util/hash/hash.util";

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
        if (!admin) throw new UnauthorizedException('Credenciales inválidas');

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