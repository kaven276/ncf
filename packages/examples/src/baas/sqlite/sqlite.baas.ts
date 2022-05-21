import { createDataSource } from '@ncf/typeorm';
import { pathPattern } from '@ncf/microkernel';

/** sqlite 的数据源对象 */
let baas = createDataSource({
  type: "better-sqlite3",
  database: './db/sqlite/sqlite.db',
  synchronize: true,
  logging: true,
  entities: [pathPattern("baas/sqlite/entity/**/*")],
  migrations: [pathPattern("baas/sqlite/migration/**/*")],
  subscribers: [pathPattern("baas/sqlite/subscriber/**/*")],
});

export default baas;
