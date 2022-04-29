import levelup, { type LevelUp } from 'levelup';
import rocksdb from 'rocksdb';
import { resolved } from '@ncf/microkernel';

// 1) Create our store
let db = resolved<LevelUp<rocksdb>>(async (addDisposer) => {
  const dbinst: LevelUp<rocksdb> = await new Promise((resolve, reject) => {
    //@ts-ignore
    levelup(rocksdb('./db/myRocksDb'), {}, (err: any, db1: LevelUp<rocksdb>) => {
      if (err) {
        reject(err);
      } else {
        resolve(db1);
      }
    });
  });
  addDisposer(async () => {
    dbinst.close();
  });
  return dbinst;
});

export default db;
