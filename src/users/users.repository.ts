// import { Injectable } from "@nestjs/common";
// import { DbService } from "src/db/db.service";


// export type User = {
//     id: number;
//     email: string;
//     name: string;
//     password_hash: string;
//     salt: string;
// };

// @Injectable()
// export class UsersRepository{
//     constructor(private readonly db: DbService) {}

//     async createUser(email:string, name:string, password:string): Promise<User | null>{
//         const sql= `INSERT INTO users (email, name, password_hash, salt) 
//         VALUES ('${email}', '${name}', '${password}', 'mysalt')`;
//         await this.db.getPool().query(sql);
//         return {
//             id: 1,
//             email,
//             name,
//             password_hash: 'hashed_password',
//             salt: 'mysalt',
//         };
//     }

//     async findByEmail(email:string): Promise<User | null> {
//         const sql = `SELECT * FROM users WHERE email = '${email}' LIMIT 1`;
//         const [rows] = await this.db.getPool().query(sql);
//         const result= rows as User[];
//         return result[0] || null;
//     }

//     async findById(id: number): Promise<User | null> {
//         const sql = `SELECT * FROM users WHERE id = ${id} LIMIT 1`;
//         const [rows] = await this.db.getPool().query(sql);
//         const result = rows as User[];
//         return result[0] || null;
//     }
//     async findAll(): Promise<User[]> {
//     const sql = `SELECT * FROM users ORDER BY id`
//     const [rows] = await this.db.getPool().query(sql)
//     return rows as User[]
//   }

//   async updateUser(id: number, updates: Partial<Pick<User, "email" | "name" | "password_hash">>): Promise<User | null> {
//     const setParts: string[] = []

//     if (updates.email) setParts.push(`email = '${updates.email}'`)
//     if (updates.name) setParts.push(`name = '${updates.name}'`)
//     if (updates.password_hash) setParts.push(`password_hash = '${updates.password_hash}'`)

//     if (setParts.length === 0) {
//       return this.findById(id)
//     }

//     const sql = `UPDATE users SET ${setParts.join(", ")} WHERE id = ${id}`
//     await this.db.getPool().query(sql)

//     return this.findById(id)
//   }
// }

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export type User = {
    id: number;
    email: string;
    name: string;
    password_hash: string;
    salt: string;
};

@Injectable()
export class UsersRepository {
    constructor(private readonly db: DbService) {}

    // MÉTODO CORREGIDO: Recibe password_hash y salt ya procesados desde el service
    async createUser(email: string, name: string, password_hash: string, salt: string): Promise<User | null> {
        const sql = `INSERT INTO users (email, name, password_hash, salt) VALUES (?, ?, ?, ?)`;
        const [result] = await this.db.getPool().query(sql, [email, name, password_hash, salt]);
        
        const insertResult = result as any;
        const userId = insertResult.insertId;
        
        return this.findById(userId);
    }

    async findByEmail(email: string): Promise<User | null> {
        const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [email]);
        const result = rows as User[];
        return result[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as User[];
        return result[0] || null;
    }

    async findAll(): Promise<User[]> {
        const sql = `SELECT * FROM users ORDER BY id`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as User[];
    }

    async updateUser(id: number, updates: Partial<Pick<User, "email" | "name" | "password_hash">>): Promise<User | null> {
        const setParts: string[] = [];
        const values: any[] = [];

        if (updates.email) {
            setParts.push(`email = ?`);
            values.push(updates.email);
        }
        if (updates.name) {
            setParts.push(`name = ?`);
            values.push(updates.name);
        }
        if (updates.password_hash) {
            setParts.push(`password_hash = ?`);
            values.push(updates.password_hash);
        }

        if (setParts.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const sql = `UPDATE users SET ${setParts.join(", ")} WHERE id = ?`;
        await this.db.getPool().query(sql, values);

        return this.findById(id);
    }
}