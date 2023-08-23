import { Injectable } from '@nestjs/common';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { DexSwapsEntity } from 'database/entities/dex-swap.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class DexSwapRepository extends BaseRepository<DexSwapsEntity> {
  constructor() {
    super(DexSwapsEntity);
  }

  async saveMany(chainNetwork: { chain: EChain; network: ENetwork }, dexSwaps: Partial<DexSwapsEntity>[]) {
    return this.upsert(chainNetwork, dexSwaps, {
      conflictPaths: ['blockNumber', 'logIndex'],
    });
  }
}
