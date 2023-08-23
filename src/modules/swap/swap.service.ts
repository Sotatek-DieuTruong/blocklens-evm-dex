import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import winston from 'winston';
import * as moment from 'moment';
import { ProtocolService } from 'modules/shared/services';
import { LoggerService } from '../shared/utils';
import { Web3Service } from '@sotatek/blocklens-web3';
import { DexPoolRepository, DexSwapRepository } from 'modules/shared/repositories';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { DexSwapsEntity } from 'database/entities/dex-swap.entity';
// import { FunctionSwapDetector } from './swap-detector/function-swap.service';
import { EventSwapDetector } from '../swap/swap-detector/event-swap.service';
import { formatShortAddress, sleep } from 'shares/helpers/utils';
import BigNumber from 'bignumber.js';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
// import { EQueueCoinTopic, EQueueName } from 'modules/shared/constants/queue.constant';
BigNumber.config({
  EXPONENTIAL_AT: 50,
});
@Injectable()
export class SwapService implements OnApplicationBootstrap {
  protected logger: winston.Logger;

  @Inject(Web3Service) web3Service: Web3Service;
  @Inject(DexSwapRepository) dexSwapRepository: DexSwapRepository;
  @Inject(ProtocolService) protocolService: ProtocolService;
  @Inject(DexPoolRepository) dexPoolRepository: DexPoolRepository;
  // @Inject(FunctionSwapDetector) functionSwapDetector: FunctionSwapDetector;
  @Inject(EventSwapDetector) eventSwapDetector: EventSwapDetector;

  // constructor(
  // @InjectQueue(EQueueName.COIN)
  // private queue: Queue,
  // ) {}

  onApplicationBootstrap() {
    this.logger = LoggerService.get(SwapService.name);
  }

  async scan(chainNetwork: { chain: EChain; network: ENetwork }, blockNumber: number) {
    const txs = await this.web3Service.getTnxWithReceiptsByBlockNum(blockNumber);

    const dexSwaps: DexSwapsEntity[] = [];
    await Promise.all(
      txs.map(async (tx) => {
        try {
          if (!tx.status) {
            this.logger.warn(`=== Skip failed tx ${tx.hash}`);
            return;
          }
          // const swapAddresses = await this.functionSwapDetector.detect(tx);
          const swapEvents = await this.eventSwapDetector.detect(chainNetwork, tx.logs);

          if (!swapEvents?.length) {
            return;
          }

          for (let i = 0; i < swapEvents.length; i++) {
            const dexSwap = {
              blockNumber: tx.blockNumber,
              timestamp: tx.timestamp,
              transactionHash: tx.hash,
              effectivePrice: new BigNumber(swapEvents[i].quantityOut).dividedBy(swapEvents[i].quantityIn).toString(),
              senderAddress: tx.from,
              blockTime: moment.unix(tx.timestamp).utc().format('YYYY-MM-DD HH:mm:ss'),
              aggregatorName: '',
              originAddress: tx.from,
              ...swapEvents[i],
            };
            this.logger.info(
              `=== Detect swap of exchange [${dexSwap.exchangeName}] tx ${formatShortAddress(tx.hash)} | ${
                dexSwap.logIndex
              }: ${formatShortAddress(dexSwap.fromTokenAddress)} -> ${formatShortAddress(dexSwap.toTokenAddress)}`,
            );
            dexSwaps.push(dexSwap as any);
          }
        } catch (e) {
          this.logger.error(`=== Error occur when process tx ${tx.hash} with error:`, e.toString());
          throw e;
        }

        await sleep(10);
      }),
    );
    // const bulkQueues = dexSwaps.map((swapEvent) => {
    //   return {
    //     name: EQueueCoinTopic.COIN_PRICE,
    //     data: {
    //       chain: chainNetwork.chain,
    //       network: chainNetwork.network,
    //       fromAddress: swapEvent.fromTokenAddress,
    //       toAddress: swapEvent.toTokenAddress,
    //       timestamp: swapEvent.timestamp,
    //       blockNumber: swapEvent.blockNumber,
    //       amountIn: swapEvent.quantityIn,
    //       amountOut: swapEvent.quantityOut,
    //     },
    //   };
    // });
    // await this.queue.addBulk(bulkQueues);

    await this.dexSwapRepository.saveMany(chainNetwork, dexSwaps);
  }
}
