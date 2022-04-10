import { createDataSource } from '@ncf/typeorm';
import { env } from 'src/env';

// 如果 export config object，使用的时候还需要解耦，非常的麻烦
// 直接 export baas，使用的时候只需 import { baas } from 即可，非常的方便
// 但是如何复用 initialize/destroy 逻辑呢？

/** 创建并初始化好的连接池，使用者直接 ts import 即可，不用关系创建和初始化工作 */
let baas = createDataSource({
  type: "postgres",
  host: env.BAAS_HOST,
  port: 25432,
  database: 'pgsqlib',
  schema: 'test1',
  username: "test1",
  password: "test1",
  synchronize: false,
  logging: false,
  entities: ["src/baas/typeorm/entity/**/*.ts"],
  migrations: ["src/baas/typeorm/migration/**/*.ts"],
  subscribers: ["src/baas/typeorm/subscriber/**/*.ts"],
});

export default baas;
