import { LogDescription } from '@ethersproject/abi';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ISwap } from '../swap.interface';
import { BaseSwapEventHandler } from './event-base.handler';
import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';

const TOPIC0 = '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';
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
        indexed: false,
        internalType: 'uint256',
        name: 'amount0In',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1In',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0Out',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1Out',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'Swap',
    type: 'event',
  },
];

@Injectable()
export class UniswapRouterV2EventHandler extends BaseSwapEventHandler {
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
    const [_, amount0In, amount1In, amount0Out, amount1Out] = log.args;
    if (new BigNumber(amount0In.toString()).isZero() || !new BigNumber(amount0Out.toString()).isZero()) {
      return {
        fromTokenAddress: dexPool.tokenAddresses[1],
        toTokenAddress: dexPool.tokenAddresses[0],
        quantityIn: new BigNumber(amount1In.toString()).toString() as any,
        quantityOut: new BigNumber(amount0Out.toString()).toString() as any,
        exchangeName: dexPool.exchangeName,
        contractVersion: dexPool.contractVersion,
      };
    }

    return {
      fromTokenAddress: dexPool.tokenAddresses[0],
      toTokenAddress: dexPool.tokenAddresses[1],
      quantityIn: new BigNumber(amount0In.toString()).toString() as any,
      quantityOut: new BigNumber(amount1Out.toString()).toString() as any,
      exchangeName: dexPool.exchangeName,
      contractVersion: dexPool.contractVersion,
    };
  };
}
