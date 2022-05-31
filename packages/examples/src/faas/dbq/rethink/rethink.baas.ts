import rethinkdb, { Connection } from 'rethinkdb';
import { resolved } from '@ncf/microkernel';

// 异步获取 mongodb 的 db 实例对象
let db = resolved<Connection>(async (addDisposer) => {
  const connection: Connection = await rethinkdb.connect({ host: 'localhost', port: 28015 });
  addDisposer(async () => {
    connection.close();
  });
  return connection;
});

export default db;
