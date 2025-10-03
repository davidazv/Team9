import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { DbService } from '../db/db.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], 
  controllers: [ReportController],
  providers: [ReportService, DbService],
})
export class ReportModule {}