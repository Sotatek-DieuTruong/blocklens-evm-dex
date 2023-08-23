import { Module } from '@nestjs/common';
import { SharedModule } from 'modules/shared/shared.module';
import { DexService } from './dex.service';
import { EventSwapDetector } from './swap-detector/event-swap.service';
import { DexPoolService } from './dex-pool/dex-pool.service';
import { BullModule } from '@nestjs/bull';
import { BACKUP_RETRY_TIME, EQueueName } from 'modules/shared/constants/queue.constant';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: EQueueName.COIN,
      settings: {
        backoffStrategies: {
          [EQueueName.COIN]: (attemptsMade: number) => BACKUP_RETRY_TIME[attemptsMade - 1] ?? 60 * 1000,
        },
      },
    }),
    HttpModule,
  ],
  providers: [DexService, EventSwapDetector, DexPoolService],
  exports: [DexService, EventSwapDetector, BullModule, HttpModule, DexPoolService],
})
export class DexModule {}
