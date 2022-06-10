import { makeRe } from 'minimatch';
import { IMiddleWare } from '@ncf/microkernel';
import { validate, showApiJsonSchema } from '@ncf/mw-validator';
import { logTimeUse } from 'src/mw/logTimeUse';
import { collectTimes } from 'src/mw/apm';
import { jwtMiddleware } from '@ncf/mw-jwt';
import { randomLatency } from 'src/mw/randomLatency';
import { verionTagMiddleware } from 'src/mw/versions';
import { mwCache } from 'src/mw/cache';
// import { createCacheMiddleware } from './thingsDependBaas';
import { mwLoggerWinston } from 'src/mw/logger-winston';
import { mwRBAC } from 'src/mw/RBAC';
import { mwInstance } from 'src/mw/ClassDemo';
import { mwReactServerRender } from '@ncf/mw-react-server-render';
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

/** lazy 方式提供中间件清单，确保所有带 resolved 声明周期的依赖模块已经 ready 后再执行j */
export const middlewares = () => {

  return [
    showApiJsonSchema,
    i18nMiddleware,
    async (ctx, next) => {
      // 如果是带身份自动测试的话，fake 出调用者身份，否则注释掉
      ctx.caller.user = 'user1';
      await next();
    },
    jwtMiddleware,
    mwLoggerWinston,
    // mwCache,
    // 如果启动了本机默认端口的 redis，才放开本中间件
    // createCacheMiddleware().middleware,
    validate,
    checkAuth,
    mwRBAC,
    logTimeUse,
    collectTimes,
    randomLatency,
    mwReactServerRender,
    mwInstance.middleware,
    verionTagMiddleware,
  ] as IMiddleWare[];
}
