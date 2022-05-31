import connection from '.';
import r from 'rethinkdb';

export const faas = async () => {
  return r.table('authors').filter(r.row('name').eq("William Adama")).run(connection);
}
