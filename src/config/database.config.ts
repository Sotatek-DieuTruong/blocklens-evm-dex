import { registerAs } from '@nestjs/config';

export const DATABASE = {
  ETH_MAINNET: 'DATABASE_ETH_MAINNET',
};

const chainWithNetwork = process.env.DECODER_TARGET;
const decoderDbs = [
  {
    name: DATABASE[chainWithNetwork],
    uri: process.env[`${chainWithNetwork}_URI`],
  },
];

export default registerAs('databases', () => {
  return [...decoderDbs];
});
