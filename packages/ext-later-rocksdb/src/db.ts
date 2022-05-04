import levelup from 'levelup';
import encode from 'encoding-down';
import rocksdb from 'rocksdb';
import { LaterTaskTuple } from './spec';

let db = levelup(encode<string, LaterTaskTuple>(rocksdb('./db/myRocksDb'), {
  keyEncoding: 'utf8',
  valueEncoding: 'json'
}));

//@ts-ignore
if (!db.supports.permanence) {
  throw new Error('Persistent storage is required')
}

//@ts-ignore
if (!db.supports.promises) {
  throw new Error('promise is required')
}

export default db;
