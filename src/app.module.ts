// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { UsersModule } from './users/users.module';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthModule } from './auth/auth.module';
// import { DbModule } from './db/db.module';
// //
// import { AdminModule } from './admin/admin.module';

// @Module({
//   imports: [DbModule, UsersModule,AuthModule,JwtModule.register({
//     global: true,
//     secret: "supersecret"  
//   }), 
//   //
//   AdminModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReportModule } from './reports/report.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './files/file.module';
import { AdminModule } from './admin/admin.module';
import { HelpModule } from './help/help.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FileModule, 
    DbModule, 
    UsersModule, 
    AuthModule, 
    ReportModule, 
    AdminModule, 
    HelpModule,
    JwtModule.register({
      global: true,
      secret: "supersecret"  
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}