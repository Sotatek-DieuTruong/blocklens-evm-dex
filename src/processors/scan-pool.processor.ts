import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { Kafka } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../modules/shared/utils';
import { PoolService } from 'modules/pool/pool.service';
import { PoolModule } from 'modules/pool/pool.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const perf = require('execution-time')();

const runDecoderProcessor = async () => {
  const appModule = await NestFactory.createApplicationContext(PoolModule);
  const poolService = appModule.get(PoolService);
  const configService = appModule.get(ConfigService);
  const logger = LoggerService.get('scan-pool.processor');

  const kafkaConfig = configService.get('kafka');
  const kafka = new Kafka({
    clientId: kafkaConfig.clientId,
    brokers: kafkaConfig.brokers,
  });

  const consumer = kafka.consumer({
    groupId: kafkaConfig.groupId,
    sessionTimeout: 2 * 600000,
  });

  await consumer.connect();

  try {
    const topic = `${configService.get('app').chainWithNetwork.toLowerCase()}.block.minted`;
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      autoCommitInterval: 10000,
      autoCommitThreshold: 10,
      eachMessage: async ({ topic, partition, message }) => {
        const { chain, network, blockNumber } = JSON.parse(`${message.value}`);
        logger.info(`Received message from topic: ${topic}/partition:${partition} with payload: ${message.value}`);
        perf.start(blockNumber);
        await poolService.scan({ chain, network }, blockNumber);

        const results = perf.stop(blockNumber);
        logger.info(`======= Decode blockNum: ${blockNumber.toLocaleString()} took ${results.preciseWords}`);
      },
    });
  } catch (error) {
    logger.error(error);
    await consumer.disconnect();
    throw error;
  }
};

runDecoderProcessor().catch((error) => {
  console.error(error.message);
  throw error;
});
