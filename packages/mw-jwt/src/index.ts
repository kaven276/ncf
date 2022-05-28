import { getDebug, getCallState, getConfig, throwServiceError, IMiddleWare, createCtxItem, createCfgItem } from '@ncf/microkernel';
import { verify, JwtPayload, TokenExpiredError, sign, SignOptions } from 'jsonwebtoken';

const debug = getDebug(module);

declare module 'jsonwebtoken' {
  interface JwtPayload {
    user: string,
  }
}

/** JWT secret 配置 */
export const cfgSecret = createCfgItem<string>(Symbol('secret'), 'has a van');

interface JWTOption {
  /** 颁发者，颁发机构 */
  issuer: string,
  /** 针对的业务域或者主题 */
  subject: string,
}

/** JWT 颁发源配置 */
export const cfgJwtOption = createCfgItem<JWTOption>(Symbol('jwt option'), {
  issuer: 'NCF',
  subject: 'examples',
});


/** 生成 JWT token */
export function signToken(user: string, opt: SignOptions) {
  const ctx = getCallState();
  const token = sign({
    user: user,
  }, cfgSecret.get(ctx), {
    ...cfgJwtOption.get(ctx),
    ...opt,
  });
  return token;
}

/** 设置和获取 jwt 串的 get/set API */
export const ctxJWT = createCtxItem<string>(Symbol('JWT string'));

/** 设置和获取 jwt 解析后的 get/set API */
export const ctxJWTStruct = createCtxItem<JwtPayload>(Symbol('JWT payload struct'));


const prefix = 'Bearer ';
const prefixLen = prefix.length;


/** jwt 检查校验和解析中间件 */
export const jwtMiddleware: IMiddleWare = async (ctx, next) => {
  if (!(ctx.gw.gwtype === 'http' || ctx.gw.gwtype === 'koa')) {
    return await next();
  }
  // 如果已经 fake 过身份，则不再处理了
  if (ctx.caller.user) {
    return await next();
  }
  const token = ctx.gw.http.req.headers.authorization;
  if (token) {
    const jwt = token.startsWith(prefix) ? token.substring(prefixLen) : token;
    ctxJWT.set(jwt);
    try {
      const parsed: JwtPayload = verify(jwt, cfgSecret.get(ctx), cfgJwtOption.get(ctx)) as JwtPayload;
      ctxJWTStruct.set(parsed);
      ctx.caller.user = parsed.user;
      ctx.caller.org = parsed.org;
    } catch (e: any) {
      if (e instanceof TokenExpiredError) {
        throwServiceError(403, `JWT 过期，超过 ${e.expiredAt}`);
      }
      throwServiceError(403, e.message + ' JWT 校验失败');
    }
  }
  await next();
}

