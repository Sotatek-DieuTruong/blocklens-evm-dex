import { LogDescription } from '@ethersproject/abi';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ISwap } from '../swap.interface';
import { BaseSwapEventHandler } from './event-base.handler';
import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';

const TOPIC0 = '0x6effdda786735d5033bfad5f53e5131abcced9e52be6c507b62d639685fbed6d';
const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'tokenGet',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amountGet',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'tokenGive',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amountGive',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'get',
        type: 'address',
      },
      {
        indexed: false,
        name: 'give',
        type: 'address',
      },
    ],
    name: 'Trade',
    type: 'event',
  },
];

@Injectable()
export class EtherDeltaEventHandler extends BaseSwapEventHandler {
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
    const protocol = await this.getProtocol(chainNetwork, contractAddress);
    if (!protocol) return null;
    const [toTokenAddress, amountOut, fromTokenAddress, amountIn] = log.args;
    return {
      quantityIn: new BigNumber(amountIn.toString()).toString() as any,
      quantityOut: new BigNumber(amountOut.toString()).toString() as any,
      toTokenAddress,
      fromTokenAddress,
      exchangeName: protocol.protocolName,
      contractVersion: protocol.contractVersion,
    };
  };
}
