import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import * as _ from 'lodash';

import { NestFactory } from '@nestjs/core';
// import * as protocols from '../data/protocols.json';
import { EChain, ENetwork, callWithChunk } from '@sotatek/blocklens-libs';
import { DexPoolRepository } from 'modules/shared/repositories';
import { DexPoolEntity } from 'database/entities/dex-pool.entity';
import { SharedModule } from '../modules/shared/shared.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires

const seed = async () => {
  const appModule = await NestFactory.createApplicationContext(SharedModule);

  const dexPoolRepository = appModule.get(DexPoolRepository);
  const fileNames = fs.readdirSync(__dirname + '/../../data-seeder/dex-pools');
  for (const fileName of fileNames) {
    console.log(`seed file ${fileName}`);
    const fileContents = fs.readFileSync(__dirname + `/../../data-seeder/dex-pools/${fileName}`, 'utf-8');
    const dexPools = JSON.parse(fileContents);
    const data: DexPoolEntity[] = (dexPools as any).map((pool) => ({
      createdBlockNumber: pool.created_block_number,
      contractAddress: pool.contract_address,
      exchangeName: pool.exchange_name,
      contractVersion: pool.contract_version,
      creatorAddress: pool.creator_address,
      tokenAddresses: pool.token_addresses,
      factoryAddress: pool.factory_address,
      metadata: pool.metadata,
      createdTimestamp: pool.created_timestamp,
      isActive: pool.is_active,
      lastActiveTimestamp: pool.last_active_timestamp,
    }));
    console.log('start seed');
    await callWithChunk(
      data,
      async (dataChunk) => {
        await dexPoolRepository.saveMany(
          { chain: EChain.ETH, network: ENetwork.MAINNET },
          _.uniqBy(dataChunk, 'contractAddress'),
        );
      },
      100000,
    );
  }

  console.log('seeded');
};

seed().catch((error) => {
  console.error(error.message);
  throw error;
});
