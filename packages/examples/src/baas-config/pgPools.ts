import type { PgPoolConfigMap } from '@ncf/baas-pg';
import { env } from 'src/env';

export const pgPoolConfigs: PgPoolConfigMap = {
  'test1': {
    host: env.BAAS_HOST,
    port: 25432,
    database: 'pgsqlib',
    user: 'test1',
    password: "test1",
  },
  'pgsqlib': {
    host: env.BAAS_HOST,
    port: 25432,
    database: 'pgsqlib',
    user: 'test1',
    password: "test1",
  },
  'echarts': {
    host: env.BAAS_HOST,
    port: 25432,
    user: 'echarts',
    password: "echarts",
  }
};
