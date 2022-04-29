import { ClassicLevel } from 'classic-level';
import { resolved } from '@ncf/microkernel';

// 1) Create our store
let db = resolved<ClassicLevel<string, any>>(async (addDisposer) => {
  const dbinst: ClassicLevel<string, any> = new ClassicLevel('./db/myClassicDb', {
    keyEncoding: 'utf8',
    valueEncoding: 'json',
  });
  addDisposer(async () => {
    dbinst.close();
  });
  return dbinst;
});

export default db;
