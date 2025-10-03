import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export type UserProfile = {
    id: number;
    email: string;
    name: string;
};

export type AccessPayload = {
    sub: string;
    type: "access";
    profile: UserProfile;
    role: "user" | "admin";
};

export type RefreshPayload = {
    sub: string;
    type: "refresh";
    role: "user" | "admin";
};

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateAccessToken(profile: UserProfile, role: "user" | "admin"): Promise<string> {
        return this.jwtService.signAsync(
            {
                sub: profile.id.toString(),
                type: "access",
                profile,
                role
            } satisfies AccessPayload,
            {
                secret: "supersecret",
                expiresIn: "1d"
            }
        );
    }

    async generateRefreshToken(profile: UserProfile, role: "user" | "admin"): Promise<string> {
        return this.jwtService.signAsync(
            {
                sub: profile.id.toString(),
                type: "refresh",
                role
            } satisfies RefreshPayload,
            {
                secret: "supersecret",
                expiresIn: "7d"
            }
        );
    }

    async verifyAccessToken(token: string): Promise<AccessPayload> {
        const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
            secret: "supersecret"
        });
        if (payload.type !== "access") {
            throw new Error("Invalid token type");
        }
        return payload;
    }

    async verifyRefreshToken(token: string): Promise<RefreshPayload> {
        const payload = await this.jwtService.verifyAsync<RefreshPayload>(token, {
            secret: "supersecret"
        });
        if (payload.type !== "refresh") {
            throw new Error("Invalid token type");
        }
        return payload;
    }
}