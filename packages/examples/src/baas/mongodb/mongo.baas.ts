import { MongoClient, Db } from 'mongodb';
import { resolved } from '@ncf/microkernel';

// 异步获取 mongodb 的 db 实例对象
let db = resolved<Db>(async (addDisposer) => {
  const client = new MongoClient('mongodb://docker:mongopw@localhost:27017');
  await client.connect();
  console.log(' --------  mongodb connected --------');
  addDisposer(async () => {
    client.close();
  });
  return client.db('ncf');
});

export default db;
