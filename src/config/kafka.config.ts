import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS?.split(','),
  groupId: process.env.KAFKA_GROUP_ID,
}));
