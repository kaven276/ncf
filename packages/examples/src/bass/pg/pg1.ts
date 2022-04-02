import { lifecycle } from './makePgPool';

let pool = lifecycle(module, {
  host: "127.0.0.1",
  port: 25432,
  database: 'pgsqlib',
  user: 'test1',
  password: "test1",
});

export default pool;
