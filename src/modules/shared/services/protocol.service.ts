import { Injectable } from '@nestjs/common';
import { ProtocolRepository } from '../repositories';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { ProtocolEntity } from 'database/entities/protocol.entity';
import { In } from 'typeorm';

@Injectable()
export class ProtocolService {
  constructor(private readonly repo: ProtocolRepository) {}

  async saveMany(chainNetwork: { chain: EChain; network: ENetwork }, protocols: Partial<ProtocolEntity>[]) {
    return this.repo.saveMany(chainNetwork, protocols);
  }

  async getByAddresses(chainNetwork: { chain: EChain; network: ENetwork }, addresses: string[]) {
    return this.repo.find(chainNetwork, {
      where: {
        contractAddress: In(addresses),
      },
    });
  }
}
