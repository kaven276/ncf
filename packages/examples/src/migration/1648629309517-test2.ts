import { MigrationInterface, QueryRunner } from "typeorm";

export class test21648629309517 implements MigrationInterface {
    name = 'test21648629309517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "person"."name" IS '人员身份证姓名'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "person"."name" IS '人员姓名'`);
    }

}
