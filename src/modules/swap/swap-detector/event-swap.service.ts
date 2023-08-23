import { Log } from 'web3-core';
import { ISwap } from './swap.interface';
import { Injectable } from '@nestjs/common';
import { EChain, ENetwork } from '@sotatek/blocklens-libs/dist/shared';
import * as eventHandlers from './event-handlers';
import { BaseSwapEventHandler } from './event-handlers/event-base.handler';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class EventSwapDetector {
  private detectors: { [key: string]: BaseSwapEventHandler } = {};

  constructor(
    protected redisService: RedisService,
    protected dexPoolRepository: DexPoolRepository,
    protected protocolRepository: ProtocolRepository,
  ) {
    Object.values(eventHandlers).forEach((Class) => {
      const handler = new Class({
        dexPoolRepository: this.dexPoolRepository,
        protocolRepository: this.protocolRepository,
        redisService: this.redisService,
      });
      this.detectors[handler.topic0] = handler;
    });
  }

  async detect(
    chainNetwork: { chain: EChain; network: ENetwork },
    logs: Log[],
  ): Promise<(ISwap & { contractAddress: string; logIndex: number; exchangeName: string; contractVersion: string })[]> {
    const listTopics = Object.keys(this.detectors);
    const validLogs = logs.filter((log) => listTopics.includes(log.topics[0]));
    const decodedLogs = await Promise.all(
      validLogs.map(async (log) => {
        try {
          const detector = this.detectors[log.topics[0]];
          if (!detector) return null;
          return await detector.decodeDex(chainNetwork, log);
        } catch (e) {
          console.error(`decode log of tx ${log.transactionHash}|${log.logIndex} with error ${e.toString()}`);
          return null;
        }
      }),
    );
    return decodedLogs.filter(Boolean);
  }
}
