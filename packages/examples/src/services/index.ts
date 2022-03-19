import { makeRe } from 'minimatch';
import { IMiddleWare } from '@ncf/engine';
import { validate } from '@ncf/mw-validator';
import { logTimeUse } from '../middlewares/logTimeUse';
import { jwtMiddleware, setJWT } from '@ncf/mw-jwt';
import { randomLatency, setRandomLatencyConfig } from '../middlewares/randomLatency';
import { setPoolName } from '../baas/testPgPool';

import { throwServiceError } from '@ncf/engine';
import { getConnFromThread } from '@ncf/baas-typeorm';
import { getJWT, getJWTStruct } from '@ncf/mw-jwt';


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
  jwtMiddleware,
  validate,
  checkAuth,
  logTimeUse,
  randomLatency,
];


export const config = {
  ...setJWT('ncf is best', {
    issuer: 'kaven276',
    subject: 'ncf example',
  }),
  ...setRandomLatencyConfig({
    maxLatencyMs: 0,
  }),
  ...setPoolName('echarts'),
}

export async function getManager() {
  const queryRunner = await getConnFromThread('postgis');
  const manager = queryRunner.manager;
  return manager;
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
