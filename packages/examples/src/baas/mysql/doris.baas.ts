import { createDataSource } from '@ncf/typeorm';

/** sqlite 的数据源对象 */
let baas = createDataSource({
  type: "mysql",
  host: "10.0.0.31",
  port: 9030,
  database: 'saas2022_dat',
  username: 'root',
  password: '',
  synchronize: false,
  logging: true,
  // 复用一下 sqlite 的模型
  entities: [],
  migrations: [],
  subscribers: [],
});

export default baas;
