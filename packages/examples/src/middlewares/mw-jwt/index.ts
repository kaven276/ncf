import { ICallState, getDebug, asyncLocalStorage } from '@ncf/engine';
import { JWT_STRUCT } from './jwt_example';

const debug = getDebug(module);
const JWT = Symbol.for('JWT');

/** 服务调用期间的全部内容 */
declare module '@ncf/engine' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [JWT]?: string,
  }
}

/**
 * 封装是因为 atob 只支持 ASCII，往后若需要支持中文等字符集，实现方式需要修改
 * @param base64Text 带转换的 base64 编码字符串
 */
function base64Decode(base64Text: string) {
  return Buffer.from(base64Text, 'base64')
}

/**
 * 将JWT字符串中的内容解析到js数据
 * @param jwtText 带提取内容到js数据的jwt原始文本
 */
function jwtDecode(jwtText: string): JWT_STRUCT {
  const jwtConent = jwtText.split('.')[1];
  return JSON.parse(base64Decode(jwtConent).toString());
}

/** jwt 分析的中间件，为了提供下面 getJWT 的 API */
export async function jwtMiddleware(ctx: ICallState, cfg: any, next: () => Promise<void>) {
  // debug(ctx.http.req.headers);
  ctx[JWT] = ctx.http.req.headers.authorization;
  await next();
}

const prefix = 'Bearer ';
const prefixLen = prefix.length;

/** 返回 ALS 中的 JWT */
export function getJWT(): string | undefined {
  const als = asyncLocalStorage.getStore()!;
  debug('als[JWT]', als[JWT]);
  if (als[JWT]) {
    return als[JWT]!.substring(prefixLen);
  } else {
    return undefined;
  }

}

export function getJWTStruct(): JWT_STRUCT | undefined {
  const token = getJWT();
  if (!token) {
    return undefined;
  }
  return jwtDecode(token);
}
