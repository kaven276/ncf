import connection from '.';
import r from 'rethinkdb';

const reql = r.table('authors')
  // .filter(r.row('name').eq("William Adama"))
  .map(a => r.expr(1))
  .reduce((left, right) => left.add(right))
  .default(0);

export const faas = async () => {
  return reql.run(connection);
}
