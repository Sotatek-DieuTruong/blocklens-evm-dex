import { CacheModule, Module } from '@nestjs/common';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import config from 'config';
import * as sharedServices from './services';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { autoImport } from 'shares/helpers/utils';
import * as repositories from './repositories';
import { Web3Module } from '@sotatek/blocklens-web3';
import { RedisModule } from 'nestjs-redis';
import { MICROSERVICE_CLIENT } from './utils/shared.constant';
import { KafkaDataSource } from 'database/kafka.source';
import { HttpModule } from '@nestjs/axios';
import { getConnectionOptions } from './connections/connections';

const microserviceProvider = {
  provide: MICROSERVICE_CLIENT,
  useFactory: (configService: ConfigService) => {
    const kafkaConfig = configService.get('kafka');
    return ClientProxyFactory.create({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: kafkaConfig.clientId,
          brokers: kafkaConfig.brokers,
        },
        consumer: {
          groupId: kafkaConfig.groupId,
        },
      },
    });
  },
  inject: [ConfigService],
};

const databaseConnections = getConnectionOptions();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: config,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('redis.host'),
        password: configService.get('redis.password'),
        port: configService.get('redis.port'),
      }),
      inject: [ConfigService],
    }),
    ClientsModule,
    CacheModule.register(),
    ...databaseConnections,
    Web3Module.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        rpcUrls: configService.get('network.ETH_MAINNET.rpcUrls'),
        fallbackRpcUrls: configService.get('network.ETH_MAINNET.otherRpcUrls'),
        // redis: {
        //   cacheKey: `${configService.get('network.ETH_MAINNET.chain')}_${configService.get(
        //     'network.ETH_MAINNET.network',
        //   )}`,
        //   ttl: configService.get('network.ETH_MAINNET.blockTime'),
        //   database: configService.get('redis.database'),
        //   url: `redis://${configService.get('redis.password')}@${configService.get('redis.host')}:${configService.get(
        //     'redis.port',
        //   )}/0`,
        // },
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  providers: [microserviceProvider, ...autoImport(sharedServices), ...autoImport(repositories), KafkaDataSource],
  exports: [
    ClientsModule,
    ConfigModule,
    RedisModule,
    microserviceProvider,
    ...autoImport(sharedServices),
    ...autoImport(repositories),
    CacheModule,
    ...databaseConnections,
    Web3Module,
    HttpModule,
  ],
})
export class SharedModule {}
