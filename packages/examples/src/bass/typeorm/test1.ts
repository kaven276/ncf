import { DataSource, makeTypeOrmDataSource } from './makeTypeOrmDataSource';

/** 创建并初始化好的连接池，使用者直接 ts import 即可，不用关系创建和初始化工作 */
export let baas: DataSource;

// 如果 export config object，使用的时候还需要解耦，非常的麻烦
// 直接 export baas，使用的时候只需 import { baas } from 即可，非常的方便
// 但是如何复用 initialize/destroy 逻辑呢？

export const _manager = makeTypeOrmDataSource({
  type: "postgres",
  host: "127.0.0.1",
  port: 25432,
  database: 'pgsqlib',
  schema: 'test1',
  username: "test1",
  password: "test1",
  synchronize: true,
  logging: true,
  // driver: {
  //   max: 2,
  // },
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
});
