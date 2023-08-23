import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDexPool1687771811319 implements MigrationInterface {
  name = 'createDexPool1687771811319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dex_pools" ("created_block_number" bigint NOT NULL, "contract_address" character varying NOT NULL, "exchange_name" character varying NOT NULL, "contract_version" character varying NOT NULL, "creator_address" character varying NOT NULL, "token_addresses" text NOT NULL, "factory_address" character varying NOT NULL, "metadata" text, "created_timestamp" TIMESTAMP NOT NULL, "is_active" boolean NOT NULL, "last_active_timestamp" TIMESTAMP NOT NULL, CONSTRAINT "PK_0115972ea7a20d35be0c89c784b" PRIMARY KEY ("contract_address"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dex_pools"`);
  }
}
