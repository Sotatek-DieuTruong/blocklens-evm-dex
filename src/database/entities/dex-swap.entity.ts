import { Column, Entity, PrimaryColumn } from 'typeorm';

const tableName = 'dex_swaps';

@Entity({ name: tableName })
// @Index(['transactionHash'])
// @Index(['timestamp'])
// @Index(['contractAddress'])
export class DexSwapsEntity {
  @PrimaryColumn({ name: 'block_number', type: 'int' })
  blockNumber: number;
  @PrimaryColumn({ name: 'log_index', type: 'int' })
  logIndex: number;

  @Column({ name: 'transaction_hash', type: 'text' })
  transactionHash: string;

  @Column({ name: 'timestamp', type: 'bigint' })
  timestamp: number;

  @Column({ name: 'exchange_name', type: 'text' })
  exchangeName: string;

  @Column({ name: 'contract_version', type: 'text' })
  contractVersion: string;

  @Column({ name: 'aggregator_name', type: 'text' })
  aggregatorName: string;

  @Column({ name: 'contract_address', type: 'text' })
  contractAddress: string;

  @Column({ name: 'from_token_address', type: 'text' })
  fromTokenAddress: string;

  @Column({ name: 'to_token_address', type: 'text' })
  toTokenAddress: string;

  @Column({ name: 'quantity_in', type: 'numeric' })
  quantityIn: number;

  @Column({ name: 'quantity_out', type: 'numeric' })
  quantityOut: number;

  @Column({ name: 'effective_price', type: 'numeric' })
  effectivePrice: number;

  @Column({ name: 'sender_address', type: 'text' })
  senderAddress: string;

  @Column({ name: 'origin_address', type: 'text' })
  originAddress: string;

  @Column({ name: 'block_time', type: 'timestamp', nullable: true })
  blockTime: Date;

  static getTableName(): string {
    return tableName;
  }

  static transformToSnakeCase(obj: DexSwapsEntity) {
    return {
      block_number: obj.blockNumber,
      log_index: obj.logIndex,
      transaction_hash: obj.transactionHash,
      timestamp: obj.timestamp,
      exchange_name: obj.exchangeName,
      contract_version: obj.contractVersion,
      aggregator_name: obj.aggregatorName,
      contract_address: obj.contractAddress,
      from_token_address: obj.fromTokenAddress,
      to_token_address: obj.toTokenAddress,
      quantity_in: obj.quantityIn?.toString(),
      quantity_out: obj.quantityOut?.toString(),
      effective_price: obj.effectivePrice?.toString(),
      sender_address: obj.senderAddress,
      origin_address: obj.originAddress,
      block_time: obj.blockTime ?? null,
    };
  }
}
