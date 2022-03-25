import type { PgPoolConfigMap } from '@ncf/baas-pg';

export const pgPoolConfigs: PgPoolConfigMap = {
  'test1': {
    host: "127.0.0.1",
    port: 25432,
    database: 'pgsqlib',
    user: 'test1',
    password: "test1",
  },
  'pgsqlib': {
    host: "127.0.0.1",
    port: 25432,
    database: 'pgsqlib',
    user: 'test1',
    password: "test1",
  },
  'echarts': {
    host: "127.0.0.1",
    port: 25432,
    user: 'echarts',
    password: "echarts",
  }
};
