import { makePgPool } from '@ncf/pg';
import { env } from 'src/env';

let pool = makePgPool({
  connectionString: env.PG_URL,
});

export default pool;
