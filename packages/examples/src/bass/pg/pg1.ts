import { lifecycle } from './makePgPool';
import { getOnlyPoolClientForTx } from 'src/bass/pg/getOnlyPoolClientForTx';

let pool = lifecycle(module, {
  host: "127.0.0.1",
  port: 25432,
  database: 'pgsqlib',
  user: 'test1',
  password: "test1",
});

export default pool;

export const getPoolClient = () => getOnlyPoolClientForTx(module.exports.default);
