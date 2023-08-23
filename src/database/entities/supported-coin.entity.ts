import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

const tableName = 'supported_coins';
@Index(['contractAddress'])
@Entity({ name: tableName })
export class SupportedCoinEntity {
  @PrimaryColumn({ name: 'id' })
  id: string;

  @Column({ name: 'symbol' })
  symbol: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'contract_address' })
  contractAddress: string;

  @Column({ name: 'source' })
  source: string;

  static getTableName(): string {
    return tableName;
  }

  static transformToSnakeCase(obj: SupportedCoinEntity) {
    return {
      id: obj.id,
      symbol: obj.symbol,
      name: obj.name,
      contract_address: obj.contractAddress,
      source: obj.source,
    };
  }
}
