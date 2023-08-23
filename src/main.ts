import * as dotenv from 'dotenv';
dotenv.config();

import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { sleep } from 'shares/helpers/utils';
import { SharedModule } from './modules/shared/shared.module';

async function bootstrap() {
  try {
    const decoder = await NestFactory.create(SharedModule);

    decoder.enableCors();

    await connectMicroService(decoder);
    await decoder.init();

    await decoder.listen(process.env.APP_PORT);
  } catch (e) {
    console.error(`Process throw exception: ${e.toString()}`);
    console.error(e);
    console.error(`Something went wrong. Process will be restart shortly`);
    sleep(3000).finally(() => process.exit(1));
  }
}

const connectMicroService = async (app: INestApplication) => {
  const configService = app.get(ConfigService);

  const kafkaConfig = configService.get('kafka');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: kafkaConfig.clientId + '.gateway',
        brokers: kafkaConfig.brokers,
      },
      consumer: {
        groupId: kafkaConfig.groupId + '.gateway',
      },
    },
  });

  await app.startAllMicroservices();
};

bootstrap();
