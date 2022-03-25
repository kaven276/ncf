import { IConfig } from '@ncf/microkernel';
import { setHowToGetPgConnection } from '@ncf/loader-sql-pg';
import { getPool } from '@ncf/baas-pg';

export const config: IConfig = {
  ext: '.sql',
  ...setHowToGetPgConnection(() => getPool()),
}
