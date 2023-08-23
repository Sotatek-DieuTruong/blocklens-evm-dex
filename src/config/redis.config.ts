import { registerAs } from '@nestjs/config';

const host = process.env.REDIS_HOST || 'localhost';
const port = process.env.REDIS_PORT || 6379;
const password = process.env.REDIS_PASSWORD || '';

export default registerAs('redis', () => ({
  host,
  port,
  password,
  url: `redis://${password}@${host}:${port}/0`,
}));
