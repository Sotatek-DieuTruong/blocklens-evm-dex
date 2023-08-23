import { Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { AppStorage } from 'config/app.config';
import { DATABASE } from 'config/database.config';
import {
  DataSource,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  InsertResult,
  QueryRunner,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { KafkaDataSource } from 'database/kafka.source';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

export abstract class BaseRepository<T> {
  // @InjectDataSource(DATABASE.BSC_MAINNET) private readonly DB_BSC_MAINNET_DATASOURCE: DataSource;
  // @InjectDataSource(DATABASE.BSC_TESTNET) private readonly DB_BSC_TESTNET_DATASOURCE: DataSource;
  // @InjectDataSource(DATABASE.ETH_GOERLI) private readonly DB_ETH_GOERLI_DATASOURCE: DataSource;
  @Optional() @InjectDataSource(DATABASE.ETH_MAINNET) private readonly DB_ETH_MAINNET_DATASOURCE: DataSource;
  // @InjectDataSource(DATABASE.POLYGON_MAINNET) private readonly DB_POLYGON_MAINNET_DATASOURCE: DataSource;
  // @InjectDataSource(DATABASE.POLYGON_MUMBAI) private readonly DB_POLYGON_MUMBAI_DATASOURCE: DataSource;

  @Inject(ConfigService) configService: ConfigService;
  @Inject(KafkaDataSource) kafkaDataSource: KafkaDataSource;

  constructor(protected readonly entity) {}

  private getDataSource(network: { chain: EChain; network: ENetwork }, appStorageOption?: AppStorage) {
    const appStorage = appStorageOption || this.configService.get<string>('app.appStorage');
    if (appStorage === AppStorage.KAFKA) {
      this.kafkaDataSource.setEntityType(this.entity);
      this.kafkaDataSource.setNetwork(network);
      return this.kafkaDataSource;
    } else if (appStorage === AppStorage.DB) {
      const chainUpper = network.chain.toUpperCase();
      const networkUpper = network.network.toUpperCase();

      // if (chainUpper === EChain.BSC && networkUpper === ENetwork.TESTNET) {
      //   return this.DB_BSC_TESTNET_DATASOURCE;
      // }
      // if (chainUpper === EChain.BSC && networkUpper === ENetwork.MAINNET) {
      //   return this.DB_BSC_MAINNET_DATASOURCE;
      // }
      if (chainUpper === EChain.ETH && networkUpper === ENetwork.MAINNET) {
        if (!this.DB_ETH_MAINNET_DATASOURCE) throw new Error(`Not found source ${chainUpper}-${networkUpper}`);
        return this.DB_ETH_MAINNET_DATASOURCE;
      }
      // if (chainUpper === EChain.ETH && networkUpper === ENetwork.GOERLI) {
      //   return this.DB_ETH_GOERLI_DATASOURCE;
      // }
      // if (chainUpper === EChain.POLYGON && networkUpper === ENetwork.MAINNET) {
      //   return this.DB_POLYGON_MAINNET_DATASOURCE;
      // }
      // if (chainUpper === EChain.POLYGON && networkUpper === ENetwork.MUMBAI) {
      //   return this.DB_POLYGON_MUMBAI_DATASOURCE;
      // }
    }
    throw new Error(`Connection chain: ${network.chain} | network: ${network.network} not support`);
  }

  getRepository(network: { chain: EChain; network: ENetwork }, appStorageOption?: AppStorage) {
    const dataSource = this.getDataSource(network, appStorageOption);
    const repository = dataSource.getRepository<T>(this.entity.name);
    return repository as any;
  }

  async findOne(
    network: { chain: EChain; network: ENetwork },
    options: FindOneOptions<T>,
    appStorageOption?: AppStorage,
  ): Promise<T | null> {
    return this.getRepository(network, appStorageOption).findOne(options);
  }

  async insert(
    network: { chain: EChain; network: ENetwork },
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    appStorageOption?: AppStorage,
  ): Promise<InsertResult> {
    return this.getRepository(network, appStorageOption).insert(entity);
  }

  async upsert(
    network: { chain: EChain; network: ENetwork },
    entityOrEntities: QueryDeepPartialEntity<any> | QueryDeepPartialEntity<any>[],
    conflictPathsOrOptions: string[] | UpsertOptions<any>,
    appStorageOption?: AppStorage,
  ): Promise<InsertResult> {
    return this.getRepository(network, appStorageOption).upsert(entityOrEntities, conflictPathsOrOptions);
  }

  async findOneAndDelete(
    network: { chain: EChain; network: ENetwork },
    criteria: string | string[] | number | number[] | Date | Date[] | FindOptionsWhere<T>,
    appStorageOption?: AppStorage,
  ): Promise<DeleteResult> {
    return this.getRepository(network, appStorageOption).delete(criteria);
  }

  async find(
    network: { chain: EChain; network: ENetwork },
    options?: FindManyOptions<any>,
    appStorageOption?: AppStorage,
  ): Promise<any[]> {
    return this.getRepository(network, appStorageOption).find(options);
  }

  async countDocuments(
    network: { chain: EChain; network: ENetwork },
    options?: FindManyOptions<T>,
    appStorageOption?: AppStorage,
  ): Promise<number> {
    return this.getRepository(network, appStorageOption).count(options);
  }

  createQueryBuilder(network, alias?: string, queryRunner?: QueryRunner, appStorageOption?: AppStorage) {
    return this.getRepository(network, appStorageOption).createQueryBuilder(alias, queryRunner);
  }

  async findOneBy(
    network,
    where: FindOptionsWhere<any> | FindOptionsWhere<any>[],
    appStorageOption?: AppStorage,
  ): Promise<any | null> {
    return this.getRepository(network, appStorageOption).findOneBy(where);
  }

  async findBy(
    network,
    where: FindOptionsWhere<any> | FindOptionsWhere<any>[],
    appStorageOption?: AppStorage,
  ): Promise<any[]> {
    return this.getRepository(network, appStorageOption).findBy(where);
  }
}
