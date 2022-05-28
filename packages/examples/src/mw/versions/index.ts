import { getDebug, createCtxItem, IMiddleWare } from '@ncf/microkernel';
import type { Tag } from './tags';
export { Tag } from './tags';

const debug = getDebug(module);

export const ctxVertionTag = createCtxItem<Tag>(Symbol('version tag'));

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
  ctxVertionTag.set(tag as unknown as Tag);
  await next();
}
