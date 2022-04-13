import { getDebug, getCallState, IMiddleWare } from '@ncf/microkernel';
import type { Tag } from './tags';
export type { Tag } from './tags';

const debug = getDebug(module);

/** 其他中间件可以根据具体的策略，比如原IP区域，用户归属等决定来设置灰度标签，使用本 Symbol 向 ctx 中设置 */
export const VersionTag = Symbol.for('VersionTag');

/** 服务调用期间的全部内容 */
declare module '@ncf/microkernel' {
  interface ICallState {
    [VersionTag]?: Tag,
  }
}

/** 返回 ALS 中的 JWT 字符串 */
export function getVerionTag(): Tag | undefined {
  const als = getCallState();
  debug('als[VersionTag]', als[VersionTag]);
  return als[VersionTag];
}

/** 从环境获取 version tag，仅仅作为参照实现 */
export const verionTagMiddleware: IMiddleWare = async (ctx, next) => {
  if (!(ctx.gw.gwtype === 'http' || ctx.gw.gwtype === 'koa')) {
    return await next();
  }
  let tag = ctx.gw.http.req.headers['x-version-tag'];
  if (Array.isArray(tag)) {
    tag = tag[0];
  }
  debug(`got tag ${tag}`);
  ctx[VersionTag] = tag as unknown as Tag;
  await next();
}
