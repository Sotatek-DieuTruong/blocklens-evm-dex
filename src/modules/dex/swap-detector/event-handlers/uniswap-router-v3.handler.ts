import { LogDescription } from '@ethersproject/abi';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ISwap } from '../swap.interface';
import { BaseSwapEventHandler } from './event-base.handler';
import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';

const TOPIC0 = '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67';
const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount0',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount1',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tick',
        type: 'int24',
      },
    ],
    name: 'Swap',
    type: 'event',
  },
];

@Injectable()
export class UniswapRouterV3EventHandler extends BaseSwapEventHandler {
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
    const [, , amount0, amount1] = log.args;
    if (new BigNumber(amount0.toString()).gt(amount1.toString())) {
      return {
        fromTokenAddress: dexPool.tokenAddresses[1],
        toTokenAddress: dexPool.tokenAddresses[0],
        quantityIn: new BigNumber(amount1.toString()).toString() as any,
        quantityOut: new BigNumber(amount0.toString()).toString() as any,
        exchangeName: dexPool.exchangeName,
        contractVersion: dexPool.contractVersion,
      };
    }

    return {
      fromTokenAddress: dexPool.tokenAddresses[0],
      toTokenAddress: dexPool.tokenAddresses[1],
      quantityIn: new BigNumber(amount0.toString()).toString() as any,
      quantityOut: new BigNumber(amount1.toString()).toString() as any,
      exchangeName: dexPool.exchangeName,
      contractVersion: dexPool.contractVersion,
    };
  };
}
