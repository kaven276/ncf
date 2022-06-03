import { makeRe } from 'minimatch';
import { getCaller, IMiddleWare } from '@ncf/microkernel';
import { validate, showApiJsonSchema } from '@ncf/mw-validator';
import { logTimeUse } from 'src/mw/logTimeUse';
import { collectTimes } from 'src/mw/apm';
import { jwtMiddleware, cfgSecret, ctxJWT, ctxJWTStruct, cfgJwtOption } from '@ncf/mw-jwt';
import { randomLatency, cfgLatency } from 'src/mw/randomLatency';
import { verionTagMiddleware } from 'src/mw/versions';
import { mwCache } from 'src/mw/cache';
import { mwLoggerWinston } from 'src/mw/logger-winston';
import { mwRBAC } from 'src/mw/RBAC';
import { mwInstance } from 'src/mw/ClassDemo';
import { mwReactServerRender } from '@ncf/mw-react-server-render';
import { throwServiceError } from '@ncf/microkernel';
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


export const middlewares: (IMiddleWare | false)[] = [
  showApiJsonSchema,
  i18nMiddleware,
  async (ctx, next) => {
    // 如果是带身份自动测试的话，fake 出调用者身份，否则注释掉
    ctx.caller.user = 'user1';
    await next();
  },
  jwtMiddleware,
  mwLoggerWinston,
  mwCache,
  validate,
  checkAuth,
  mwRBAC,
  logTimeUse,
  collectTimes,
  randomLatency,
  mwReactServerRender,
  mwInstance.middleware,
  verionTagMiddleware,
];


export const config = {
  ...cfgSecret.set('ncf is best'),
  ...cfgJwtOption.set({
    issuer: 'kaven276',
    subject: 'ncf example',
  }),
  ...cfgLatency.set({
    maxLatencyMs: 0,
  }),
}

export const PI = 3.1415926;

export function check401() {
  if (!getCaller().user) {
    throwServiceError(401, '未认证');
  }
}

export function checkIsAdmin() {
  console.log('checkIsAdmin', ctxJWTStruct.get());
  console.log('getJWT', ctxJWT.get());
  // todo: threadStore.jwt?.sub 报异常 error TS1109: Expression expected.
  if (getCaller().user !== 'admin') {
    throwServiceError(403, '不是管理员')
  }
}
