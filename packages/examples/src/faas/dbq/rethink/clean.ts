import connection from '.';
import r from 'rethinkdb';

export const faas = async () => {
  return r.table('authors').delete().run(connection);
}
