import { registerAs } from '@nestjs/config';
export enum AppStorage {
  DB = 'DB',
  KAFKA = 'KAFKA',
}

type TDecoderConfig = {
  chainWithNetwork: string;
  appStorage: AppStorage;
  druidUri: string;
};

export default registerAs(
  'app',
  () =>
    ({
      chainWithNetwork: process.env.DECODER_TARGET,
      appStorage: process.env.APP_STORAGE as AppStorage,
      druidUri: process.env.DRUID_URI,
    } as TDecoderConfig),
);
