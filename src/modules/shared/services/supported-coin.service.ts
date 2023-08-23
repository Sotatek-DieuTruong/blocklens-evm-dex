import { Injectable } from '@nestjs/common';
import { SupportedCoinRepository } from '../repositories';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { SupportedCoinEntity } from 'database/entities/supported-coin.entity';

@Injectable()
export class SupportedCoinService {
  constructor(private readonly repo: SupportedCoinRepository) {}

  async saveMany(chainNetwork: { chain: EChain; network: ENetwork }, coins: Partial<SupportedCoinEntity>[]) {
    return this.repo.saveMany(chainNetwork, coins);
  }
}
