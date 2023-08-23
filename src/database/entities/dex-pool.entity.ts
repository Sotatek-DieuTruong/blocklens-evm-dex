import { Column, Entity, PrimaryColumn } from 'typeorm';

const tableName = 'dex_pools';

@Entity({ name: tableName })
// @Index(['transactionHash'])
// @Index(['timestamp'])
// @Index(['contractAddress'])
export class DexPoolEntity {
  @Column({ name: 'created_block_number', type: 'bigint' })
  createdBlockNumber: number;

  @PrimaryColumn({ name: 'contract_address', type: 'varchar' })
  contractAddress: string;

  @Column({ name: 'exchange_name', type: 'varchar' })
  exchangeName: string;

  @Column({ name: 'contract_version', type: 'varchar' })
  contractVersion: string;

  @Column({ name: 'creator_address', type: 'varchar' })
  creatorAddress: string;

  @Column({
    name: 'token_addresses',
    type: 'text',
    transformer: {
      to: (value) => JSON.stringify(value),
      from: (value) => {
        return JSON.parse(value);
      },
    },
  })
  tokenAddresses: string;

  @Column({ name: 'factory_address', type: 'varchar' })
  factoryAddress: string;

  @Column({ name: 'metadata', type: 'text', nullable: true })
  metadata: string;

  @Column({ name: 'created_timestamp', type: 'timestamp' })
  createdTimestamp: Date;

  @Column({ name: 'is_active', type: 'bool' })
  isActive: boolean;

  @Column({ name: 'last_active_timestamp', type: 'timestamp' })
  lastActiveTimestamp: Date;

  static getTableName(): string {
    return tableName;
  }

  static transformToSnakeCase(obj: DexPoolEntity) {
    return {
      created_block_number: obj.createdBlockNumber,
      contract_address: obj.contractAddress,
      exchange_name: obj.exchangeName,
      contract_version: obj.contractVersion,
      creator_address: obj.creatorAddress,
      token_addresses: obj.tokenAddresses,
      factory_address: obj.factoryAddress,
      metadata: obj.metadata ?? null,
      created_timestamp: obj.createdTimestamp,
      is_active: obj.isActive,
      last_active_timestamp: obj.lastActiveTimestamp,
    };
  }
}
