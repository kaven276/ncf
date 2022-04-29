import { createDataSource } from '@ncf/typeorm';
import { env } from 'src/env';

let baas = createDataSource({
  type: "postgres",
  url: env.TYPEORM_URL,
  schema: env.ORM_PG_SCHEMA,
  synchronize: true,
  logging: true,
  entities: ["src/baas/typeorm/entity/**/*.ts"],
  migrations: ["src/baas/typeorm/migration/**/*.ts"],
  subscribers: ["src/baas/typeorm/subscriber/**/*.ts"],
});

export default baas;
