import { LogDescription } from '@ethersproject/abi';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ISwap } from '../swap.interface';
import { BaseSwapEventHandler } from './event-base.handler';
import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';

const TOPIC0 = '0xd6d4f5681c246c9f42c203e287975af1601f8df8035a9251f79aab5c8f09e2f8';
const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IERC20',
        name: 'srcToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IERC20',
        name: 'dstToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'dstReceiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'spentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'returnAmount',
        type: 'uint256',
      },
    ],
    name: 'Swapped',
    type: 'event',
  },
];

@Injectable()
export class OneInchV3EventHandler extends BaseSwapEventHandler {
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
    const [_, srcToken, dstToken, , spentAmount, returnAmount] = log.args;
    return {
      quantityIn: new BigNumber(spentAmount.toString()).toString() as any,
      quantityOut: new BigNumber(returnAmount.toString()).toString() as any,
      fromTokenAddress: srcToken,
      toTokenAddress: dstToken,
      exchangeName: protocol.protocolName,
      contractVersion: protocol.contractVersion,
    };
  };
}
