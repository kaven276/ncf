import { ICallState, getDebug, getCallState, throwServiceError } from '@ncf/engine';
import { verify, JwtPayload, TokenExpiredError } from 'jsonwebtoken';

const debug = getDebug(module);
const JWT = Symbol.for('JWT');
const JWTParsed = Symbol.for('JWTParsed');

/** 服务调用期间的全部内容 */
declare module '@ncf/engine' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [JWT]?: string,
    /** sdfsd */
    [JWTParsed]?: JwtPayload,
  }
}

declare module 'jsonwebtoken' {
  interface JwtPayload {
    user: string,
  }
}

const secret = 'has a van';
const prefix = 'Bearer ';
const prefixLen = prefix.length;

/** jwt 检查校验和解析中间件 */
export async function jwtMiddleware(ctx: ICallState, cfg: any, next: () => Promise<void>) {
  const token = ctx.http.req.headers.authorization;
  if (token) {
    const jwt = token.substring(prefixLen);
    ctx[JWT] = jwt;
    try {
      const parsed: JwtPayload = verify(jwt, secret, {
        issuer: 'NCF',
        subject: 'examples',
      }) as JwtPayload;
      ctx[JWTParsed] = parsed;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throwServiceError(403, `JWT 过期，超过 ${e.expiredAt}`);
      }
      throwServiceError(403, e.message + ' JWT 校验失败');
    }
  }
  await next();
}


/** 返回 ALS 中的 JWT 字符串 */
export function getJWT(): string | undefined {
  const als = getCallState();
  debug('als[JWT]', als[JWTParsed]);
  return als[JWT];
}

/** 返回 ALS 中的 JWT 解析后的数据结构 */
export function getJWTStruct(): JwtPayload | undefined {
  const als = getCallState();
  return als[JWTParsed];
}
