import * as dotenv from 'dotenv';
dotenv.config();
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, KafkaMessage } from 'kafkajs';
import { Inject } from '@nestjs/common';
import winston from 'winston';
import { LoggerService } from 'modules/shared/utils';
import { callWithChunk, sleep } from '@sotatek/blocklens-libs';
import { randomUUID } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const perf = require('execution-time')();

export abstract class BasedBlockConsumer {
  protected kafka: Kafka;
  protected consumer: Consumer;
  protected logger: winston.Logger;
  @Inject(ConfigService)
  protected configService: ConfigService;
  protected topic: string;

  setup(options: { topic: string; clientId: string; brokers: string[]; groupId?: string }) {
    const { topic, brokers, clientId, groupId } = options;
    this.topic = topic;

    this.kafka = new Kafka({
      clientId,
      brokers,
      connectionTimeout: 120000,
      requestTimeout: 240000,
    });
    this.consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 60000,
      heartbeatInterval: 25000,
      rebalanceTimeout: 120000,
    });
    this.logger = LoggerService.get(clientId);
    this.logger.info(`Setting up`, {
      topic,
      groupId,
      brokers,
    });
  }

  async run() {
    try {
      this.consumer.on(this.consumer.events.CRASH, async (event) => {
        console.error('********** Consumer crash', event);
        console.error('********** Sleep 60s before exit to restart');
        await sleep(60000);
        process.exit(1);
      });
      this.consumer.on(this.consumer.events.REQUEST_TIMEOUT, async (event) => {
        console.error('********** Consumer request timeout', event);
        console.error('********** Sleep 60s before exit to restart');
        await sleep(60000);
        process.exit(1);
      });
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });
      await this.consumer.run({
        eachBatchAutoResolve: true,
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
          this.logger.info(
            `******** Received new batch messages from topic: ${batch.topic}/partition:${batch.partition} with ${batch.messages.length} messages ********`,
          );
          try {
            await callWithChunk(
              batch.messages,
              async (batchMessages) => {
                const uuid = randomUUID();
                perf.start(uuid);
                const executors = [];
                for (const message of batchMessages) {
                  if (!isRunning() || isStale()) break;
                  executors.push(this.eachMessage(message));
                  resolveOffset(message.offset);
                }
                await Promise.all(executors);
                await heartbeat();
                const results = perf.stop(uuid);
                this.logger.info(
                  `===== Collected (uuid: ${uuid}) ${batchMessages.length} messages took ${results.preciseWords}`,
                );
              },
              50,
            );
          } catch (e) {
            this.logger.info(`[ERROR] Error occurred while consuming message: `, e);
            throw e;
          }
        },
      });
    } catch (error) {
      await sleep(60000);
      await this.consumer.disconnect();
      throw error;
    }
  }

  abstract eachMessage(payload: KafkaMessage): Promise<void>;
}
