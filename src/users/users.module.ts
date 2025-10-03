/* eslint-disable prettier/prettier */

import { Module, forwardRef } from "@nestjs/common"
import { UsersController } from "./users.controller"
import { UserService } from "./users.service"
import { UsersRepository } from "./users.repository"
import { AuthModule } from "../auth/auth.module"

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UserService, UsersRepository],
  exports: [UserService],
})
export class UsersModule {}
