import { IConfig } from '@ncf/microkernel';
import { setHowToGetPgConnection } from '@ncf/loader-sql-pg';
import { getPGPool } from 'src/baas/testPgPool';

export const config: IConfig = {
  ext: '.sql',
  ...setHowToGetPgConnection(() => getPGPool('pgsqlib')),
}
