import { ICallState, getDebug, asyncLocalStorage } from '@ncf/engine';
import { JWT_STRUCT } from './jwt_example';
import * as jws from 'jws';

const debug = getDebug(module);
const JWT = Symbol.for('JWT');

/** 服务调用期间的全部内容 */
declare module '@ncf/engine' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [JWT]?: string,
  }
}

const prefix = 'Bearer ';
const prefixLen = prefix.length;

/** jwt 分析的中间件，为了提供下面 getJWT 的 API */
export async function jwtMiddleware(ctx: ICallState, cfg: any, next: () => Promise<void>) {
  const token = ctx.http.req.headers.authorization;
  if (token) {
    ctx[JWT] = token.substring(prefixLen);;
  }
  await next();
}


/** 返回 ALS 中的 JWT */
export function getJWT(): string | undefined {
  const als = asyncLocalStorage.getStore()!;
  debug('als[JWT]', als[JWT]);
  return als[JWT];
}

export function getJWTStruct(): JWT_STRUCT | undefined {
  const token = getJWT();
  if (!token) {
    return undefined;
  }
  return JSON.parse(jws.decode(token).payload);
}
