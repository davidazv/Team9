import { forwardRef, Module } from "@nestjs/common"
import { UsersModule } from "src/users/users.module"
import { TokenService } from "./token.service"
import { AuthController } from "./auth.controller"

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [TokenService],
  controllers: [AuthController],
  exports: [TokenService],
})
export class AuthModule {}
