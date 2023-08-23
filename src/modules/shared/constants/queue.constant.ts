import { ONE_MINUTE_IN_MS } from './time.constant';

export enum EQueueName {
  COIN = 'COIN',
}

export enum EQueueCoinTopic {
  COIN_PRICE = 'COIN_PRICE',
}

export const BACKUP_RETRY_TIME = [1, 10, 60, 2 * 60, 6 * 60].map((minute) => minute * ONE_MINUTE_IN_MS);
