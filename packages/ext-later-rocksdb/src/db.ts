import levelup from 'levelup';
import encode from 'encoding-down';
import rocksdb from 'rocksdb';
import { LaterTaskTuple } from './spec';
import assert from 'node:assert';

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

assert(String(Date.now()).length === 13, 'Date.now() 返回的长度应该为 13');

export function random(): string {
  return String(Math.random()).substring(1);
}
