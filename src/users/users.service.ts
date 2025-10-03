import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { hashPassword } from "src/util/hash/hash.util";
import { NotFoundException } from "@nestjs/common";
import { UserResponseDto } from "./dto/user-response.dto";
import { UpdateUserDto } from "./dto/user-update.dto";
import * as crypto from "crypto";

@Injectable()
export class UserService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async createUser(email: string, name: string, password: string) {
        console.log("=== CREANDO USUARIO ===");
        console.log("Email:", email);
        console.log("Password:", password);
        
        // Generar salt único
        const salt = crypto.randomBytes(16).toString('hex');
        console.log("Salt generado:", salt);
        
        // Hashear la contraseña con el salt
        const hashed_password = hashPassword(password, salt);
        console.log("Hash generado:", hashed_password);
        
        // Pasar tanto el hash como el salt al repository
        return this.usersRepository.createUser(email, name, hashed_password, salt);
    }

    async findById(id: number) {
        return this.usersRepository.findById(id);
    }

    async validateUser(email: string, password: string) {
        console.log("=== VALIDANDO USUARIO ===");
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            console.log(`Usuario no encontrado: ${email}`);
            return null;
        }
        
        console.log("Usuario encontrado:", user.email);
        console.log("Password ingresado:", password);
        console.log("Salt en DB:", user.salt);
        console.log("Hash en DB:", user.password_hash);
        
        const hashedInputPassword = hashPassword(password, user.salt);
        console.log("Hash calculado:", hashedInputPassword);
        
        const isValid = user.password_hash === hashedInputPassword;
        console.log("¿Contraseña válida?", isValid);
        
        return isValid ? user : null;
    }

    async getAllUsers(): Promise<UserResponseDto[]> {
        const users = await this.usersRepository.findAll();
        return users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
        }));
    }

    async getUserById(id: number): Promise<UserResponseDto> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }

    async updateUser(id: number, updateData: UpdateUserDto): Promise<UserResponseDto> {
        console.log("updateData recibido:", updateData);
        if (!updateData) {
            throw new Error("No se enviaron datos para actualizar");
        }
        
        const existingUser = await this.usersRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        const updates: any = {};
        if (updateData.email) updates.email = updateData.email;
        if (updateData.name) updates.name = updateData.name;
        if (updateData.password) {
            updates.password_hash = hashPassword(updateData.password, existingUser.salt);
        }

        const updatedUser = await this.usersRepository.updateUser(id, updates);

        if (!updatedUser) {
            throw new NotFoundException(`Error al actualizar usuario con ID ${id}`);
        }

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
        };
    }
}