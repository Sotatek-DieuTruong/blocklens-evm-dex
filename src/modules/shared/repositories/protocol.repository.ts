import { Injectable } from '@nestjs/common';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ProtocolEntity } from 'database/entities/protocol.entity';
import { BaseRepository } from './base.repository';
import { AppStorage } from 'config/app.config';

@Injectable()
export class ProtocolRepository extends BaseRepository<ProtocolEntity> {
  constructor() {
    super(ProtocolEntity);
  }

  async saveMany(chainNetwork: { chain: EChain; network: ENetwork }, protocols: Partial<ProtocolEntity>[]) {
    return this.upsert(chainNetwork, protocols, {
      conflictPaths: ['contractAddress'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  getOne(network: { chain: EChain; network: ENetwork }, option): Promise<ProtocolEntity> {
    return this.findOne(
      network,
      {
        where: option,
      },
      AppStorage.DB,
    );
  }
}
