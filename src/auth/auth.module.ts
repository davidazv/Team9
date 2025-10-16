import { forwardRef, Module } from "@nestjs/common"
import { UsersModule } from "src/users/users.module"
import { DbModule } from "src/db/db.module"
import { TokenService } from "./token.service"
import { AuthController } from "./auth.controller"

@Module({
  imports: [forwardRef(() => UsersModule), DbModule],
  providers: [TokenService],
  controllers: [AuthController],
  exports: [TokenService],
})
export class AuthModule {}
