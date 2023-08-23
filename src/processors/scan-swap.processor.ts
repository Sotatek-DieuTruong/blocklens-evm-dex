import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { Injectable, Module, Scope } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';
import { BasedBlockConsumer } from './kafka-comsumer';
import { SwapService } from 'modules/swap/swap.service';
import { SwapModule } from 'modules/swap/swap.module';

@Injectable({ scope: Scope.TRANSIENT })
export class DecodeDexConsumer extends BasedBlockConsumer {
  constructor(private readonly dexService: SwapService) {
    super();
  }
  async eachMessage(message: KafkaMessage): Promise<void> {
    const { blockNumber, chain, network } = JSON.parse(`${message.value}`);
    await this.dexService.scan({ chain, network }, blockNumber);
  }
}

@Module({
  imports: [SwapModule],
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
