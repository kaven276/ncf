import db from './classic.baas';
import { ClassicLevel } from 'classic-level';
import { resolved } from '@ncf/microkernel';

/** 延迟执行队列 1,651,240.845,006 时间数字要到进位，需要到 2493-04-03T20:23:21.260Z 年，所以字符串化可以保证按时间顺序排列 */
//@ts-ignore
let later = resolved<ClassicLevel<string, any>>(async (addDisposer) => {
  const dbinst = db.sublevel<string, any>('later', {
    valueEncoding: 'json',
  })
  addDisposer(async () => {
    dbinst.close();
  });
  return dbinst;
});

export default later;
