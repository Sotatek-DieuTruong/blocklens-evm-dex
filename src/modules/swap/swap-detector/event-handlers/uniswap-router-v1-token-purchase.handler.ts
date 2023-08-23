import { LogDescription } from '@ethersproject/abi';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ISwap } from '../swap.interface';
import { BaseSwapEventHandler } from './event-base.handler';
import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';

const TOPIC0 = '0xcd60aa75dea3072fbc07ae6d7d856b5dc5f4eee88854f5b4abf7b680ef8bc50f';
const ABI = [
  {
    name: 'TokenPurchase',
    inputs: [
      {
        type: 'address',
        name: 'buyer',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'eth_sold',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'tokens_bought',
        indexed: true,
      },
    ],
    anonymous: false,
    type: 'event',
  },
];

@Injectable()
export class TokenPurchaseEventHandler extends BaseSwapEventHandler {
  constructor(source: {
    dexPoolRepository: DexPoolRepository;
    protocolRepository: ProtocolRepository;
    redisService: RedisService;
  }) {
    super(TOPIC0, ABI, source);
  }

  detect = async (
    chainNetwork: { chain: EChain; network: ENetwork },
    contractAddress: string,
    log: LogDescription,
  ): Promise<ISwap> => {
    const dexPool = await this.getPool(chainNetwork, contractAddress);
    if (!dexPool) return null;
    const [toTokenAddress, amountIn, amountOut] = log.args;
    return {
      quantityIn: new BigNumber(amountIn.toString()).toString() as any,
      quantityOut: new BigNumber(amountOut.toString()).toString() as any,
      toTokenAddress,
      fromTokenAddress: '0x0000000000000000000000000000000000000000',
      exchangeName: dexPool.exchangeName,
      contractVersion: dexPool.contractVersion,
    };
  };
}
