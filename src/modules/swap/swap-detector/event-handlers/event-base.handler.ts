import { Injectable } from '@nestjs/common';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { DexPoolEntity } from 'database/entities/dex-pool.entity';
import { ProtocolEntity } from 'database/entities/protocol.entity';
import { DexPoolRepository, ProtocolRepository } from 'modules/shared/repositories';
import { RedisService } from 'nestjs-redis';
import { Log } from 'web3-core';
import { Interface, LogDescription } from '@ethersproject/abi';
import { ISwap } from '../swap.interface';

const DEFAULT_CACHE_TIME = 60 * 60; // set expiry time is 1 h

@Injectable()
export abstract class BaseSwapEventHandler {
  protected dexPoolRepository: DexPoolRepository;
  protected protocolRepository: ProtocolRepository;
  protected redisService: RedisService;
  protected interface: Interface;

  constructor(
    public topic0: string,
    public abi,
    source: {
      dexPoolRepository: DexPoolRepository;
      protocolRepository: ProtocolRepository;
      redisService: RedisService;
    },
  ) {
    this.dexPoolRepository = source.dexPoolRepository;
    this.protocolRepository = source.protocolRepository;
    this.redisService = source.redisService;
    this.interface = new Interface(abi);
  }

  protected async getPool(chainNetwork: { chain: EChain; network: ENetwork }, address: string) {
    const key = `${chainNetwork.chain}_${chainNetwork.network}_dex_swap_get_pool_${address}`;
    const pool = await this.redisService.getClient().get(key);
    if (pool) return <DexPoolEntity>JSON.parse(pool);
    const dexPool = await this.dexPoolRepository.getByAddress(chainNetwork, address);
    if (!dexPool) return null;
    await this.redisService.getClient().setex(key, DEFAULT_CACHE_TIME, JSON.stringify(dexPool));

    return dexPool;
  }

  protected async getProtocol(chainNetwork: { chain: EChain; network: ENetwork }, address: string) {
    const key = `${chainNetwork.chain}_${chainNetwork.network}_dex_swap_get_protocol_${address}`;
    const cachedProtocol = await this.redisService.getClient().get(key);
    if (cachedProtocol) return <ProtocolEntity>JSON.parse(cachedProtocol);
    const protocol = await this.protocolRepository.getOne(chainNetwork, {
      contractAddress: address,
    });
    if (!protocol) return null;
    await this.redisService.getClient().setex(key, DEFAULT_CACHE_TIME, JSON.stringify(protocol));

    return protocol;
  }

  private decodeLog(log: Log) {
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

  async decodeDex(chainNetwork: { chain: EChain; network: ENetwork }, log: Log) {
    const decoded = this.decodeLog(log);
    if (!decoded) return null;
    const swapInfo = await this.detect(chainNetwork, log.address, decoded);

    if (!swapInfo) return null;
    return {
      ...swapInfo,
      contractAddress: log.address,
      logIndex: log.logIndex,
    };
  }

  protected abstract detect(
    chainNetwork: { chain: EChain; network: ENetwork },
    contractAddress: string,
    log: LogDescription,
  ): Promise<ISwap>;
}
