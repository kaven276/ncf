import { makePgPool } from '@ncf/pg';
import { env } from 'src/env';

let pool = makePgPool({
  host: env.BAAS_HOST,
  port: 25432,
  database: 'pgsqlib',
  user: 'test1',
  password: "test1",
});

export default pool;
