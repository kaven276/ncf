import { makeRe } from 'minimatch';
import { IMiddleWare } from '@ncf/microkernel';
import { validate } from '@ncf/mw-validator';
import { logTimeUse } from 'src/mw/logTimeUse';
import { collectTimes } from 'src/mw/apm';
import { jwtMiddleware, setJWT } from '@ncf/mw-jwt';
import { randomLatency, setRandomLatencyConfig } from 'src/mw/randomLatency';
import { verionTagMiddleware } from 'src/mw/versions';
import { mwCache } from 'src/mw/cache';
import { throwServiceError } from '@ncf/microkernel';
import { getJWT, getJWTStruct } from '@ncf/mw-jwt';
import { i18nMiddleware } from 'src/i18n';

const faasRegExp = makeRe('/faas2*');

/** 延迟开始执行不超过任意毫秒数  */
export const checkAuth: IMiddleWare = async (ctx, next) => {
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
  i18nMiddleware,
  // jwtMiddleware,
  mwCache,
  validate,
  checkAuth,
  logTimeUse,
  collectTimes,
  randomLatency,
  verionTagMiddleware,
];


export const config = {
  ...setJWT('ncf is best', {
    issuer: 'kaven276',
    subject: 'ncf example',
  }),
  ...setRandomLatencyConfig({
    maxLatencyMs: 0,
  }),
}

export const PI = 3.1415926;

export function check401() {
  if (!getJWT()) {
    throwServiceError(401, '未认证');
  }
}

export function checkIsAdmin() {
  console.log('checkIsAdmin', getJWTStruct());
  // todo: threadStore.jwt?.sub 报异常 error TS1109: Expression expected.
  if (getJWTStruct() && getJWTStruct()!.user !== 'admin')
    throwServiceError(403, '不是管理员')
}
