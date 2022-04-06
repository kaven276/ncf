import { IConfig } from '@ncf/microkernel';
import { setHowToGetPgConnection } from '@ncf/loader-sql-pg';
import pool from 'src/baas/pg/pg1.baas';

export const config: IConfig = {
  ext: '.sql',
  ...setHowToGetPgConnection(() => pool),
}
