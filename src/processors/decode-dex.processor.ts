import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { Injectable, Module, Scope } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';
import { BasedBlockConsumer } from './kafka-comsumer';
import { SharedModule } from 'modules/shared/shared.module';
import { DexModule } from 'modules/dex/dex.module';
import { DexService } from 'modules/dex/dex.service';

@Injectable({ scope: Scope.TRANSIENT })
export class DecodeDexConsumer extends BasedBlockConsumer {
  constructor(private readonly dexService: DexService) {
    super();
  }
  async eachMessage(message: KafkaMessage): Promise<void> {
    const { blockNumber, chain, network } = JSON.parse(`${message.value}`);
    await this.dexService.scan({ chain, network }, blockNumber);
  }
}

@Module({
  imports: [SharedModule, DexModule],
  providers: [DecodeDexConsumer],
  exports: [],
})
class ConsumerModule {
  constructor(private readonly configService: ConfigService, private readonly consumer: DecodeDexConsumer) {
    const [chainConfig, networkConfig] = this.configService.get('app.chainWithNetwork').split('_');
    const topic = `${chainConfig.toLowerCase()}_${networkConfig.toLowerCase()}.block.minted`;
    const kafkaConfig = this.configService.get('kafka');
    this.consumer.setup({
      topic,
      brokers: kafkaConfig.brokers,
      clientId: kafkaConfig.clientId,
      groupId: process.env.APP_ENV !== 'local' ? kafkaConfig.groupId : kafkaConfig.groupId + '.dex-test',
    });
    this.consumer.run().then();
  }
}

const run = async () => {
  const consumer = await NestFactory.create(ConsumerModule);
  await consumer.init();
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
