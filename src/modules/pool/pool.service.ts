import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import winston from 'winston';
import { ITransactionWithReceipt, Web3Service } from '@sotatek/blocklens-web3';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { Log } from 'web3-core';
import { RedisService } from 'nestjs-redis';
import { Interface, LogDescription } from '@ethersproject/abi';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { DexPoolEntity } from 'database/entities/dex-pool.entity';
import * as _ from 'lodash';
import { ProtocolEntity } from 'database/entities/protocol.entity';
import { LoggerService } from 'modules/shared/utils';

/*
 *
 * Unable to get transaction: 0x73372ed8a5f49a4b390fbe99bf4a3f2129ec68bec0ea1d8890c48cbde26a8804
 *
 */

const PAIR_CREATED_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token0',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token1',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'PairCreated',
    type: 'event',
  },
];

const DEPLOYED_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract Mooniswap',
        name: 'mooniswap',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'token1',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'token2',
        type: 'address',
      },
    ],
    name: 'Deployed',
    type: 'event',
  },
];

const POOL_CREATED_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token0',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token1',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
    ],
    name: 'PoolCreated',
    type: 'event',
  },
];

const LOG_NEW_POOL_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
    ],
    name: 'LOG_NEW_POOL',
    type: 'event',
  },
];

const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';
const DEPLOYED_TOPIC = '0xc95935a66d15e0da5e412aca0ad27ae891d20b2fb91cf3994b6a3bf2b8178082';
const POOL_CREATED_TOPIC = '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118';
const LOG_NEW_POOL_TOPIC = '0x8ccec77b0cb63ac2cafd0f5de8cdfadab91ce656d262240ba8a6343bccc5f945';

const abis = [...PAIR_CREATED_ABI, ...DEPLOYED_ABI, ...POOL_CREATED_ABI, ...LOG_NEW_POOL_ABI];

const DEFAULT_CACHE_TIME = 60 * 60; // set expiry time is 1 h

@Injectable()
export class PoolService implements OnApplicationBootstrap {
  protected logger: winston.Logger;
  protected interface: Interface;

  @Inject(Web3Service) web3Service: Web3Service;
  @Inject(ProtocolRepository) protocolRepository: ProtocolRepository;
  @Inject(DexPoolRepository) dexPoolRepository: DexPoolRepository;
  @Inject(RedisService) private redisService: RedisService;

  onApplicationBootstrap() {
    this.logger = LoggerService.get(PoolService.name);
    this.interface = new Interface(abis);
  }

  async scan(chainNetwork: { chain: EChain; network: ENetwork }, blockNumber: number) {
    const tnxWithReceipts = await this.web3Service.getTnxWithReceiptsByBlockNum(blockNumber);

    if (_.isEmpty(tnxWithReceipts)) {
      return;
    }

    const dexPools = [];
    for (const tnxWithReceipt of tnxWithReceipts) {
      const logs = tnxWithReceipt.logs;

      if (_.isEmpty(logs)) continue;
      for (const log of logs) {
        let dexPool: DexPoolEntity | null = null;

        const firstTopic = log.topics[0];

        // get corresponding detect function
        const detectFunction = this.mappingDetector[firstTopic];
        if (detectFunction) {
          dexPool = await detectFunction(chainNetwork, tnxWithReceipt, this.decodeLog(log), log);
        }

        if (dexPool) {
          dexPools.push(dexPool);
        }
      }
    }

    if (_.isEmpty(dexPools)) return;
    await this.dexPoolRepository.saveMany(chainNetwork, dexPools);

    this.logger.info('saved_db_decoded_dex_pool');
  }

  private async getProtocolFactoryType(chainNetwork: { chain: EChain; network: ENetwork }, address: string) {
    const key = `${chainNetwork.chain}_${chainNetwork.network}_dex_swap_get_protocol_factory_${address}`;
    const cachedProtocol = await this.redisService.getClient().get(key);
    if (cachedProtocol) {
      return <ProtocolEntity>JSON.parse(cachedProtocol);
    }

    const protocol = await this.protocolRepository.getOne(chainNetwork, {
      contractAddress: address,
      contractType: 'factory',
    });
    await this.redisService.getClient().setex(key, DEFAULT_CACHE_TIME, JSON.stringify(protocol));

    return protocol;
  }

  detectPairCreated = async (
    chainNetwork: { chain: EChain; network: ENetwork },
    tnxWithReceipt: ITransactionWithReceipt,
    decodedLog: LogDescription,
    log: Log,
  ): Promise<DexPoolEntity> => {
    const protocol = await this.getProtocolFactoryType(chainNetwork, log.address);
    if (!protocol) return null;

    return {
      createdBlockNumber: tnxWithReceipt.blockNumber,
      createdTimestamp: tnxWithReceipt.blockTime,
      exchangeName: protocol.protocolName,
      contractVersion: protocol.contractVersion,
      contractAddress: decodedLog.args['pair'],
      tokenAddresses: [decodedLog.args['token0'], decodedLog.args['token1']] as any,
      creatorAddress: tnxWithReceipt.from,
      factoryAddress: log.address,
      metadata: '',
      isActive: true,
      lastActiveTimestamp: new Date(),
    };
  };

  detectDeveloped = async (
    chainNetwork: { chain: EChain; network: ENetwork },
    tnxWithReceipt: ITransactionWithReceipt,
    decodedLog: LogDescription,
    log: Log,
  ): Promise<DexPoolEntity> => {
    const protocol = await this.getProtocolFactoryType(chainNetwork, log.address);
    if (!protocol) return null;

    return {
      createdBlockNumber: tnxWithReceipt.blockNumber,
      createdTimestamp: tnxWithReceipt.blockTime,
      exchangeName: protocol.protocolName,
      contractVersion: protocol.contractVersion,
      contractAddress: decodedLog.args['mooniswap'],
      tokenAddresses: [decodedLog.args['token1'], decodedLog.args['token2']] as any,
      creatorAddress: tnxWithReceipt.from,
      factoryAddress: log.address,
      metadata: '',
      isActive: true,
      lastActiveTimestamp: new Date(),
    };
  };

  detectPoolCreated = async (
    chainNetwork: { chain: EChain; network: ENetwork },
    tnxWithReceipt: ITransactionWithReceipt,
    decodedLog: LogDescription,
    log: Log,
  ): Promise<DexPoolEntity> => {
    const protocol = await this.getProtocolFactoryType(chainNetwork, log.address);
    if (!protocol) return null;

    return {
      createdBlockNumber: tnxWithReceipt.blockNumber,
      createdTimestamp: tnxWithReceipt.blockTime,
      exchangeName: protocol.protocolName,
      contractVersion: protocol.contractVersion,
      contractAddress: decodedLog.args['pool'],
      tokenAddresses: [decodedLog.args['token0'], decodedLog.args['token1']] as any,
      creatorAddress: tnxWithReceipt.from,
      factoryAddress: log.address,
      metadata: '',
      isActive: true,
      lastActiveTimestamp: new Date(),
    };
  };

  detectLogNewPool = async (
    chainNetwork: { chain: EChain; network: ENetwork },
    tnxWithReceipt: ITransactionWithReceipt,
    decodedLog: LogDescription,
    log: Log,
  ): Promise<DexPoolEntity> => {
    const protocol = await this.getProtocolFactoryType(chainNetwork, log.address);
    if (!protocol) return null;

    const pairToken = await this.getPairTokenLogNewPool(decodedLog.args['pool']);

    return {
      createdBlockNumber: tnxWithReceipt.blockNumber,
      createdTimestamp: tnxWithReceipt.blockTime,
      exchangeName: protocol.protocolName,
      contractVersion: protocol.contractVersion,
      contractAddress: decodedLog.args['pool'],
      tokenAddresses: pairToken as any,
      creatorAddress: decodedLog.args['caller'],
      factoryAddress: log.address,
      metadata: '',
      isActive: true,
      lastActiveTimestamp: new Date(),
    };
  };

  protected async getPairTokenLogNewPool(
    contractAddress: string,
    type: 'otherRpcUrls' | 'rpcUrls' = 'rpcUrls',
  ): Promise<string[]> {
    const web3 = this.web3Service.getClient(type);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const contractABI = require('./logNewPoolABI.json');
    const web3Contract = new web3.eth.Contract(contractABI, contractAddress);
    return web3Contract.methods.getFinalTokens().call();
  }

  protected decodeLog(log: Log) {
    try {
      return this.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });
    } catch (e) {
      console.warn(`==== decode log ${log.transactionHash} | ${log.logIndex} failed with error`, e);
      return null;
    }
  }

  get mappingDetector() {
    return {
      [PAIR_CREATED_TOPIC]: this.detectPairCreated,
      [DEPLOYED_TOPIC]: this.detectDeveloped,
      [POOL_CREATED_TOPIC]: this.detectPoolCreated,
      [LOG_NEW_POOL_TOPIC]: this.detectLogNewPool,
    };
  }
}
