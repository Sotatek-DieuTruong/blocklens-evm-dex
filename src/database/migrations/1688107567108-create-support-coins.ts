import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSupportedCoins1688107567108 implements MigrationInterface {
  name = 'createSupportedCoins1688107567108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "supported_coins" (
            "id" character varying NOT NULL, 
            "symbol" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "contract_address" character varying NOT NULL, 
            "source" character varying NOT NULL, 
            CONSTRAINT "PK_80fec0acce42bd96d8dd882af8e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "supported_coins"`);
  }
}
