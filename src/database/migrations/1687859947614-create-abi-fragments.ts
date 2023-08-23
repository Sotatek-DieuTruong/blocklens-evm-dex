import { MigrationInterface, QueryRunner } from 'typeorm';

export class createAbiFragments1687859947614 implements MigrationInterface {
  name = 'createAbiFragments1687859947614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "abi_fragments" ("encode_signature" character varying NOT NULL, "signature" character varying NOT NULL, "abi_item" text NOT NULL, CONSTRAINT "PK_bdb41e8f48b69abc0c7c877e579" PRIMARY KEY ("signature"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "abi_fragments"`);
  }
}
