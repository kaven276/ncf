import { createDataSource } from '@ncf/typeorm';
import { pathPattern } from '@ncf/microkernel';

/** sqlite 的数据源对象 */
let baas = createDataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  database: 'ncf',
  username: 'root',
  password: 'secret',
  synchronize: true,
  logging: true,
  // 复用一下 sqlite 的模型
  entities: [pathPattern("baas/sqlite/entity/**/*")],
  migrations: [pathPattern("baas/sqlite/migration/**/*")],
  subscribers: [pathPattern("baas/sqlite/subscriber/**/*")],
});

export default baas;
