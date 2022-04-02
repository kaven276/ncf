import { DataSource, makeTypeOrmDataSource } from './makeTypeOrmDataSource';

/** 创建并初始化好的连接池，使用者直接 ts import 即可，不用关系创建和初始化工作 */
export let baas: DataSource;

export const _lifecycle = makeTypeOrmDataSource({
  type: "postgres",
  host: "127.0.0.1",
  port: 25432,
  database: 'pgsqlib',
  schema: 'test1',
  username: "test1",
  password: "test1",
  synchronize: true,
  logging: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
});
