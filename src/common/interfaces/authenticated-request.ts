import { AccessPayload } from "src/auth/token.service"
import { Request } from "express"

export type AuthenticatedUser = {
    userId: string;
    profile: {
        id: number;
        email: string;
        name: string;
    };
    role: "user" | "admin";
    raw: any;
};

export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}