import levelup, { type LevelUp } from 'levelup';
import leveldown, { type LevelDown } from 'leveldown';
import { resolved } from '@ncf/microkernel';

// 1) Create our store
let db = resolved<LevelUp<LevelDown>>(async (addDisposer) => {
  const dbinst: LevelUp<LevelDown> = await new Promise((resolve, reject) => {
    //@ts-ignore
    levelup(leveldown('./db/myLevelDb'), {}, (err: any, db1: LevelUp<LevelDown>) => {
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
