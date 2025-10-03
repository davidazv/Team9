import { Controller, Get, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ReportModule } from './reports/report.module';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Module({
  imports: [ReportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}