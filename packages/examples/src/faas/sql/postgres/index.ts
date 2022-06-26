import { IConfig } from '@ncf/microkernel';
import { cfgPgConnection } from '@ncf/loader-sql-pg';
import pool from 'src/baas/pg/pg1.baas';

export const config: IConfig = {
  ext: '.sql',
  ...cfgPgConnection.set(() => pool),
}
