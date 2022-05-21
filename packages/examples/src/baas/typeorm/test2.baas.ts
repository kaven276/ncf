import { createDataSource } from '@ncf/typeorm';
import { env } from 'src/env';
import { pathPattern } from '@ncf/microkernel';

let baas = createDataSource({
  type: "postgres",
  url: env.TYPEORM_URL,
  schema: env.ORM_PG_SCHEMA,
  synchronize: true,
  logging: true,
  entities: [pathPattern("baas/typeorm/entity/**/*")],
  migrations: [pathPattern("baas/typeorm/migration/**/*")],
  subscribers: [pathPattern("baas/typeorm/subscriber/**/*")],
});

export default baas;
