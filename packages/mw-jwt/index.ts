import { getDebug, getCallState, getConfig, throwServiceError, IMiddleWare } from '@ncf/microkernel';
import { verify, JwtPayload, TokenExpiredError, sign, SignOptions } from 'jsonwebtoken';

const debug = getDebug(module);
const JWT = Symbol.for('JWT');
const JWTParsed = Symbol.for('JWTParsed');

/** 服务调用期间的全部内容 */
declare module '@ncf/microkernel' {
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

const secretKey = Symbol('secret');
const jwtOptionKey = Symbol('jwtOption');

interface JWTOption {
  issuer: string,
  subject: string,
}

export function setJWT(secret: string, jwtOption: JWTOption) {
  return {
    [secretKey]: secret,
    [jwtOptionKey]: jwtOption,
  }
}

/** 生成 JWT token */
export function signToken(user: string, opt: SignOptions) {
  const ctx = getCallState();
  const token = sign({
    user: user,
  }, getConfig(secretKey, ctx), {
    ...getConfig(jwtOptionKey, ctx),
    ...opt,
  });
  return token;
}

const defaultSecret = 'has a van';
const defaultJwtOption: JWTOption = {
  issuer: 'NCF',
  subject: 'examples',
}

const prefix = 'Bearer ';
const prefixLen = prefix.length;

/** jwt 检查校验和解析中间件 */
export const jwtMiddleware: IMiddleWare = async (ctx, next) => {
  const token = ctx.http.req.headers.authorization;
  if (token) {
    const jwt = token.substring(prefixLen);
    ctx[JWT] = jwt;
    try {
      const secret: string = getConfig(secretKey, ctx) || defaultSecret;
      const option: JWTOption = getConfig(jwtOptionKey, ctx) || defaultJwtOption;
      const parsed: JwtPayload = verify(jwt, secret, option) as JwtPayload;
      ctx[JWTParsed] = parsed;
    } catch (e: any) {
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
