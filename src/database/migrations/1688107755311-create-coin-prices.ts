import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCoinPrice1688107755311 implements MigrationInterface {
  name = 'createCoinPrice1688107755311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "coin_prices" ("token_address" character varying NOT NULL, "price" numeric NOT NULL, "block_time" TIMESTAMP NOT NULL, "timestamp" bigint NOT NULL, "block_number" bigint NOT NULL, CONSTRAINT "PK_4951734823073e628f664941ce5" PRIMARY KEY ("token_address"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "coin_prices"`);
  }
}
