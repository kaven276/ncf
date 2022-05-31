import connection from '.';
import r from 'rethinkdb';

export const faas = async () => {
  return await r.db('test').tableCreate('authors').run(connection);
}
