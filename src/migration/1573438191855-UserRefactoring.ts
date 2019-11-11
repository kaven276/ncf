import {MigrationInterface, QueryRunner} from "typeorm";

export class UserRefactoring1573438191855 implements MigrationInterface {
    name = 'UserRefactoring1573438191855'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "sex" character varying NOT NULL DEFAULT 'male'`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "sex"`, undefined);
    }

}
