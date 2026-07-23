import { Module } from '@nestjs/common';
import { SpendingService } from './services/spending.service';
import { SpendingController } from './controllers/spending.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SpendingController],
  providers: [SpendingService],
  exports: [SpendingService],
})
export class SpendingModule {}
