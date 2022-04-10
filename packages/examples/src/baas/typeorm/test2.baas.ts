import { createDataSource } from '@ncf/typeorm';
import { env } from 'src/env';

let baas = createDataSource({
  type: "postgres",
  host: env.BAAS_HOST,
  port: 25432,
  database: 'pgsqlib',
  schema: 'test1',
  username: "test1",
  password: "test1",
  synchronize: true,
  logging: true,
  entities: ["src/baas/typeorm/entity/**/*.ts"],
  migrations: ["src/baas/typeorm/migration/**/*.ts"],
  subscribers: ["src/baas/typeorm/subscriber/**/*.ts"],
});

export default baas;
