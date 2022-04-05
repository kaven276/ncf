import { lifecycle } from './makeTypeOrmDataSource';
import { env } from 'src/env';

let baas = lifecycle(module, {
  type: "postgres",
  host: env.BAAS_HOST,
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

export default baas;