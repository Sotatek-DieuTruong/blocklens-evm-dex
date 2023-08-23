import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { SupportedCoinEntity } from './../../../database/entities/supported-coin.entity';
import { AppStorage } from 'config/app.config';

@Injectable()
export class SupportedCoinRepository extends BaseRepository<SupportedCoinEntity> {
  constructor() {
    super(SupportedCoinEntity);
  }

  async saveMany(network: { chain: EChain; network: ENetwork }, coins: Partial<SupportedCoinEntity>[]) {
    return this.upsert(network, coins, {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async getSupportedToken(network: { chain: EChain; network: ENetwork }, contractAddress: string) {
    return this.findOne(
      network,
      {
        where: {
          contractAddress,
        },
      },
      AppStorage.DB,
    );
  }
}
