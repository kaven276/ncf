import { makeRe } from 'minimatch';
import { check401, checkIsAdmin } from '.';
import { IMiddleWare, IConfig } from '@ncf/engine';
import { validate } from '@ncf/mw-validator';
import { logTimeUse } from '../middlewares/logTimeUse';
import { jwtMiddleware } from '../middlewares/mw-jwt';
import { randomLatency, setRandomLatencyConfig } from '../middlewares/randomLatency';

const faasRegExp = makeRe('/faas2*');

/** 延迟开始执行不超过任意毫秒数  */
export const checkAuth: IMiddleWare = async (ctx, cfg, next) => {
  // console.log(`${ctx.path} is calling`);
  // console.log(path, faasRegExp.test(path));
  if (faasRegExp.test(ctx.path)) {
    // check401();
    // checkIsAdmin();
    // throw new ServiceError(403, '禁止访问 /faas*');
  }
  await next();
}


export const middlewares = [
  jwtMiddleware,
  validate,
  checkAuth,
  logTimeUse,
  randomLatency,
];


export const config: IConfig = {
  ...setRandomLatencyConfig({
    maxLatencyMs: 0,
  }),
  pool: 'test',
}

