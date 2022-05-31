import connection from '.';
import r from 'rethinkdb';

const reql = r.table('authors').filter(r.row('name').eq("William Adama"));

export const faas = async () => {
  return reql.run(connection);
}
