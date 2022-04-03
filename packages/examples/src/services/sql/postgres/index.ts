import { IConfig } from '@ncf/microkernel';
import { setHowToGetPgConnection } from '@ncf/loader-sql-pg';
import pool from 'src/bass/pg/pg1';

export const config: IConfig = {
  ext: '.sql',
  ...setHowToGetPgConnection(() => pool),
}
