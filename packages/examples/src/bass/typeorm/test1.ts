import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

const dsOptions: DataSourceOptions = {
  type: "postgres",
  host: "127.0.0.1",
  port: 25432,
  database: 'pgsqlib',
  schema: 'test1',
  username: "test1",
  password: "test1",
  synchronize: false,
  logging: false,
  // driver: {
  //   max: 2,
  // },
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
}

let ds: DataSource;
/** 标准的异步函数，返回创建好的数据库连接池 */
export const baas = async () => {
  ds = ds ?? new DataSource(dsOptions);
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  return ds;
}

/** hotUpdate 时，或者进程退出时，将会被系统自动执行，正常的清理资源 */
export async function destroy() {
  if (ds && ds.isInitialized) {
    // console.info('test1 baas typeorm pool destroying...')
    await ds.destroy();
  }
}
