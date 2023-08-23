import { Module } from '@nestjs/common';
import { SharedModule } from 'modules/shared/shared.module';
import { EventSwapDetector } from '../swap/swap-detector/event-swap.service';
import { BullModule } from '@nestjs/bull';
import { BACKUP_RETRY_TIME, EQueueName } from 'modules/shared/constants/queue.constant';
import { HttpModule } from '@nestjs/axios';
import { SwapService } from './swap.service';

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
  providers: [SwapService, EventSwapDetector],
  exports: [SwapService, EventSwapDetector, BullModule, HttpModule],
})
export class SwapModule {}
