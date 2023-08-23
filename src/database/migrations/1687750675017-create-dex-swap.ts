import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDexSwap1687750675017 implements MigrationInterface {
  name = 'createDexSwap1687750675017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "protocols" ("contract_address" text NOT NULL, "protocol_name" text NOT NULL, "contract_version" text NOT NULL, "contract_type" text NOT NULL, "tables" text NOT NULL, CONSTRAINT "PK_38073c6c079809b541024de0550" PRIMARY KEY ("contract_address"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "dex_swaps" ("block_number" integer NOT NULL, "log_index" integer NOT NULL, "transaction_hash" text NOT NULL, "timestamp" bigint NOT NULL, "exchange_name" text NOT NULL, "contract_version" text NOT NULL, "aggregator_name" text NOT NULL, "contract_address" text NOT NULL, "from_token_address" text NOT NULL, "to_token_address" text NOT NULL, "quantity_in" numeric NOT NULL, "quantity_out" numeric NOT NULL, "effective_price" numeric NOT NULL, "sender_address" text NOT NULL, "origin_address" text NOT NULL, "block_time" TIMESTAMP, CONSTRAINT "PK_b330c1df37e93b9a3eeac83cef5" PRIMARY KEY ("block_number", "log_index"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dex_swaps"`);
    await queryRunner.query(`DROP TABLE "protocols"`);
  }
}
