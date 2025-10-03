import { Module } from "@nestjs/common"
import { UsersModule } from "src/users/users.module"
import { AuthModule } from "src/auth/auth.module"
import { AdminUsersController } from "./admin.controller"

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AdminUsersController],
})
export class AdminModule {}
