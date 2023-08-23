import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import * as _ from 'lodash';

import { NestFactory } from '@nestjs/core';
// import * as protocols from '../data/protocols.json';
import { ProtocolService } from 'modules/shared/services';
import { EChain, ENetwork, callWithChunk } from '@sotatek/blocklens-libs';
import { ProtocolEntity } from 'database/entities/protocol.entity';
import { SharedModule } from '../modules/shared/shared.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires

const seed = async () => {
  const appModule = await NestFactory.createApplicationContext(SharedModule);

  const protocolService = appModule.get(ProtocolService);
  const fileContents = fs.readFileSync(__dirname + '/../../data-seeder/protocols.json', 'utf-8');
  const protocols = JSON.parse(fileContents);
  const data: ProtocolEntity[] = (protocols as any).map((protocol) => ({
    contractAddress: protocol.contract_address,
    protocolName: protocol.protocol_name,
    contractVersion: protocol.contract_version,
    contractType: protocol.contract_type,
    tables: protocol.tables,
  }));
  console.log('start seed');
  await callWithChunk(
    data,
    async (dataChunk) => {
      await protocolService.saveMany(
        { chain: EChain.ETH, network: ENetwork.MAINNET },
        _.uniqBy(dataChunk, 'contractAddress'),
      );
    },
    10000,
  );
  console.log('seeded');
};

seed().catch((error) => {
  console.error(error.message);
  throw error;
});
