import { registerAs } from '@nestjs/config';

let MONGODB_URI = '';
process.argv.forEach(function (val) {
  if (val.includes('MONGODB_URI=')) MONGODB_URI = val?.replace('MONGODB_URI=', '');
});
export default registerAs('seeder', () => ({
  databaseUri: MONGODB_URI,
}));

export const abiS3Urls = [
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/01H27S5KVEB7CRJJE3H2D8QJ3T.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/01H29Z5ATFZ0YBR02482JQXFFB.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/01H29ZG9JY1VJ3ZXXT9VCCDNVT.csv',
  // 'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts0v2.csv',
  // 'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts30000v2.csv',
  // 'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts60000v2.csv',
  // 'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts90000v2.csv',
  // 'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts120000v2.csv',
  // 'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts150000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts180000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts210000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts240000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts270000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts300000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts330000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts360000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts390000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts420000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts450000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts480000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts510000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts540000v2.csv',
  'https://dune-dataset.s3.ap-southeast-1.amazonaws.com/contracts570000v2.csv',
];
