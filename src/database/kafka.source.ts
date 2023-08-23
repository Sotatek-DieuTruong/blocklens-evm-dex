import { EChain, ENetwork } from '@sotatek/blocklens-libs';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

import { Kafka, Message, Producer } from 'kafkajs';
import kafkaConfig from '../config/kafka.config';
import { createHexHash } from 'shares/helpers/utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const retry = require('async-retry');

class KafkaRepository {
  network: { chain: EChain; network: ENetwork };
  entityType;
  producer: Producer;
  kafka: Kafka;
  isProducerConnected;

  constructor(network, entityType) {
    this.kafka = new Kafka({
      clientId: `${kafkaConfig().clientId}_${entityType.getTableName()}_${new Date().valueOf()}`,
      brokers: kafkaConfig().brokers,
      retry: {
        maxRetryTime: 10,
        initialRetryTime: 1000,
        factor: 2,
        multiplier: 1,
        retries: 10,
      },
    });
    this.network = network;
    this.entityType = entityType;
  }

  async upsert(data: any) {
    await this.emitMessage(this.network, data);
  }

  async save(data: any) {
    await this.emitMessage(this.network, data);
  }

  async connectProducer() {
    if (!this.producer) {
      this.producer = this.kafka.producer();
    }
    if (!this.isProducerConnected) {
      await retry(
        async () => {
          await this.producer.connect();
        },
        {
          retries: 10,
          minTimeout: 10000,
          maxTimeout: 30000,
        },
      );
      this.isProducerConnected = true;
    }
  }

  private async emitMessage(network: { chain: EChain; network: ENetwork }, data) {
    await this.connectProducer();
    try {
      const tableName = this.entityType.getTableName();
      const messages = this.buildMessages(data);

      const topic = `${network.chain}_${network.network}.data.${tableName}`.toUpperCase();
      await this.producer.send({ topic, messages });
    } catch (e) {
      this.isProducerConnected = false;
      await this.producer?.disconnect();
      throw e;
    }
  }

  private getPartitionByTimestamp(timestamp: number) {
    if (timestamp === 0) return 0;
    if (!timestamp) return null;
    return moment.unix(timestamp).utc().month();
  }

  private buildMessages(data): Message[] {
    let messages: Message[] = [];
    if (Array.isArray(data)) {
      messages = data.map((dataObj) => ({
        key: createHexHash(dataObj),
        value: this.stringifyObject(this.entityType.transformToSnakeCase(dataObj)),
        ...(dataObj.timestamp && { partition: this.getPartitionByTimestamp(dataObj.timestamp) }),
      }));
    } else {
      messages.push({
        key: createHexHash(data),
        value: this.stringifyObject(this.entityType.transformToSnakeCase(data)),
        ...(data.timestamp && { partition: this.getPartitionByTimestamp(data.timestamp) }),
      });
    }
    return messages;
  }

  private stringifyObject(obj) {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object' && !(obj[key] instanceof Date)) {
        obj[key] = JSON.stringify(obj[key]);
      }
    }
    return JSON.stringify(obj);
  }
}

@Injectable()
export class KafkaDataSource {
  private network;
  private entityType;
  private repositories: Map<string, KafkaRepository> = new Map();

  setNetwork(network) {
    this.network = network;
  }

  setEntityType(entityType) {
    this.entityType = entityType;
  }

  getRepository() {
    const key = this.entityType.getTableName();
    let repo = this.repositories.get(key);
    if (!repo) {
      repo = new KafkaRepository(this.network, this.entityType);
      this.repositories.set(key, repo);
    }

    return repo;
  }
}
