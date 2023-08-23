/* eslint-disable @typescript-eslint/no-var-requires */
import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { SupportedCoinEntity } from '../database/entities/supported-coin.entity';
import { EChain, ENetwork, callWithChunk } from '@sotatek/blocklens-libs';
import * as _ from 'lodash';
import { SupportedCoinService } from 'modules/shared/services';
import * as web3 from 'web3-utils';
import { SharedModule } from 'modules/shared/shared.module';

const run = async () => {
  const appModule = await NestFactory.createApplicationContext(SharedModule);

  const supportedCoinService = appModule.get(SupportedCoinService);
  const data = fs.readFileSync(__dirname + '/../../data-seeder/supported-coins.json', 'utf-8');
  const coins = JSON.parse(data);
  const coins2Save: SupportedCoinEntity[] = coins
    .filter((coin) => coin.platforms['ethereum'])
    .map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      contractAddress: web3.toChecksumAddress(coin.platforms.ethereum),
      source: 'coingecko',
    }));
  console.log('start seed');
  await callWithChunk(
    coins2Save,
    async (coinsChunk) => {
      await supportedCoinService.saveMany(
        { chain: EChain.ETH, network: ENetwork.MAINNET },
        _.uniqBy(coinsChunk, 'contractAddress'),
      );
    },
    1000,
  );
  console.log('seeded');
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
