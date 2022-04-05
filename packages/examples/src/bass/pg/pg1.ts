import { lifecycle } from './makePgPool';
import { getOnlyPoolClientForTx } from 'src/bass/pg/getOnlyPoolClientForTx';
import { env } from 'src/env';

let pool = lifecycle(module, {
  host: env.BAAS_HOST,
  port: 25432,
  database: 'pgsqlib',
  user: 'test1',
  password: "test1",
});

export default pool;

export const getPoolClient = () => getOnlyPoolClientForTx(module.exports.default);
