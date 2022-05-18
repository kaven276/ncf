import { createDataSource } from '@ncf/typeorm';
import { env } from 'src/env';

// 如果 export config object，使用的时候还需要解耦，非常的麻烦
// 直接 export baas，使用的时候只需 import { baas } from 即可，非常的方便
// 但是如何复用 initialize/destroy 逻辑呢？

/** 创建并初始化好的连接池，使用者直接 ts import 即可，不用关系创建和初始化工作 */
let baas = createDataSource({
  type: "better-sqlite3",
  database: './db/sqlite/sqlite.db',
  synchronize: true,
  logging: true,
  entities: ["src/baas/sqlite/entity/**/*.ts"],
  migrations: ["src/baas/sqlite/migration/**/*.ts"],
  subscribers: ["src/baas/sqlite/subscriber/**/*.ts"],
});

export default baas;
