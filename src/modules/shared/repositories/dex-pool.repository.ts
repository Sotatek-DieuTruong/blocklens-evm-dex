import { Injectable } from '@nestjs/common';
import { EChain, ENetwork, callWithChunk } from '@sotatek/blocklens-libs';
import { DexPoolEntity } from 'database/entities/dex-pool.entity';
import { BaseRepository } from './base.repository';
import { AppStorage } from 'config/app.config';

@Injectable()
export class DexPoolRepository extends BaseRepository<DexPoolEntity> {
  constructor() {
    super(DexPoolEntity);
  }

  async saveMany(chainNetwork: { chain: EChain; network: ENetwork }, dexPools: Partial<DexPoolEntity>[]) {
    return callWithChunk(
      dexPools,
      async (chunkPools) =>
        this.upsert(chainNetwork, chunkPools, {
          conflictPaths: ['contractAddress'],
        }),
      200,
    );
  }

  async getByAddress(chainNetwork: { chain: EChain; network: ENetwork }, contractAddress: string) {
    return await this.findOne(
      chainNetwork,
      {
        where: {
          contractAddress,
        },
      },
      AppStorage.DB,
    );
  }
}
