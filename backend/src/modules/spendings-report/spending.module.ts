import { Module } from '@nestjs/common';
import { SpendingReportService } from './services/spending-report.service';
import { SpendingReportController } from './controllers/spending-report.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SpendingReportController],
  providers: [SpendingReportService],
  exports: [SpendingReportService],
})
export class SpendingReportModule {}
