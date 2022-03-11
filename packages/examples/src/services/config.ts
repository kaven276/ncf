import { makeRe } from 'minimatch';
import { check401, checkIsAdmin } from '.';
import { IMiddleWare } from '@ncf/engine';
import { logTimeUse } from '../middlewares/logTimeUse';
import { randomLatency, IRandomLatencyConfig } from '../middlewares/randomLatency';

const faasRegExp = makeRe('/faas2*');

/** 延迟开始执行不超过任意毫秒数  */
export const checkAuth: IMiddleWare = async (ctx, cfg: any, next) => {
  console.log(`${ctx.path} is calling`);
  // console.log(path, faasRegExp.test(path));
  if (faasRegExp.test(ctx.path)) {
    check401();
    checkIsAdmin();
    // throw new ServiceError(403, '禁止访问 /faas*');
  }
  next();
}

export const middlewares = [
  checkAuth,
  logTimeUse,
  randomLatency,
];


// export config = new WeakMap({
//   randomLatency: { maxLatencyMs: 2000 }
// })
