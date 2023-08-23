import { LogDescription } from '@ethersproject/abi';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ISwap } from '../swap.interface';
import { BaseSwapEventHandler } from './event-base.handler';
import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';

const TOPIC0 = '0x7f4091b46c33e918a0f3aa42307641d17bb67029427a5369e54b353984238705';
const ABI = [
  {
    name: 'EthPurchase',
    inputs: [
      {
        type: 'address',
        name: 'buyer',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'tokens_sold',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'eth_bought',
        indexed: true,
      },
    ],
    anonymous: false,
    type: 'event',
  },
];

@Injectable()
export class ETHPurchaseEventHandler extends BaseSwapEventHandler {
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
    const [fromTokenAddress, amountIn, amountOut] = log.args;
    return {
      quantityIn: new BigNumber(amountIn.toString()).toString() as any,
      quantityOut: new BigNumber(amountOut.toString()).toString() as any,
      toTokenAddress: '0x0000000000000000000000000000000000000000',
      fromTokenAddress,
      exchangeName: dexPool.exchangeName,
      contractVersion: dexPool.contractVersion,
    };
  };
}
