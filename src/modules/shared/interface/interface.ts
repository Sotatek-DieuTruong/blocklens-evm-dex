export interface IRawTrace {
  id: number;
  blockNumber: number;
  from: string;
  to: string;
  input: string;
  output: string;
  value: string;
  gasUsed: number;
  gas: number;
  parentTxHash: string;
  blockTimestamp: number;
  type: string;
  status: boolean;
  error: string;
  traceId: string;
}

export interface IRawTransaction {
  blockHash: string;
  blockNumber: number;
  blockTime: number;
  hash: string;
  nonce: string;
  txIndex: number;
  from: string;
  to: string;
  value: string;
  gasPrice: number;
  gas: number;
  block: number | string | any;
  logs: ITxLog[];
  input: string;
  status: boolean;
  contractAddress?: string;
  cumulativeGasUsed?: number;
  gasUsed: number;
  effectiveGasPrice?: number;
  logsBloom: string;
}

export interface ITxLog {
  txHash: string;
  txIndex: number;
  blockHash: string;
  blockNumber: number;
  blockTime: number;
  logIndex: number;
  contractAddress: string;
  transaction: number | string | any;
  data: string;
  topic0: string;
  topic1: string;
  topic2: string;
  topic3: string;
  removed: boolean;
}
