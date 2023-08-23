import { Column, Entity, PrimaryColumn } from 'typeorm';

const tableName = 'protocols';

@Entity({ name: tableName })
export class ProtocolEntity {
  @PrimaryColumn({ name: 'contract_address', type: 'text' })
  contractAddress: string;

  @Column({ name: 'protocol_name', type: 'text' })
  protocolName: string;

  @Column({ name: 'contract_version', type: 'text' })
  contractVersion: string;

  @Column({ name: 'contract_type', type: 'text' })
  contractType: string;

  @Column({ name: 'tables', type: 'simple-array' })
  tables: string;

  static getTableName(): string {
    return tableName;
  }

  static transformToSnakeCase(obj: ProtocolEntity) {
    return {
      contract_address: obj.contractAddress,
      protocol_name: obj.protocolName,
      contract_version: obj.contractVersion,
      contract_type: obj.contractType,
      tables: obj.tables,
    };
  }
}
