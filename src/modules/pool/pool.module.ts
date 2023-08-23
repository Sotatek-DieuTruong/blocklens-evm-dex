import { Module } from '@nestjs/common';
import { SharedModule } from 'modules/shared/shared.module';
import { PoolService } from './pool.service';

@Module({
  imports: [SharedModule],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
