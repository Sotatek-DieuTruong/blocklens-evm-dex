// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { DataSource } from 'typeorm';

export const EthMainnetDataSource = new DataSource({
  name: 'DATABASE_ETH_MAINNET',
  type: 'postgres',
  url: process.env.ETH_MAINNET_URI,
  synchronize: false,
  logging: true,
  logger: 'file',
  migrationsTableName: 'migrations',
  entities: ['src/database/entities/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
