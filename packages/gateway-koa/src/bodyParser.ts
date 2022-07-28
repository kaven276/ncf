import type { Middleware } from 'koa';
import { parse } from 'node:querystring';

/** 解析请求数据，json/form 形式的，不包含文件上传的 */
export const bodyparser: () => Middleware = () => async (ctx, next) => {
  const chunks = [];
  let length = 0;
  for await (const chunk of ctx.req) {
    chunks.push(chunk);
    length += chunk.length;
  }
  const reqText = Buffer.concat(chunks, length).toString();
  if (ctx.request.type.startsWith('application/json')) {
    ctx.request.body = JSON.parse(reqText) || {};
  } else if (ctx.request.type.startsWith('application/x-www-form-urlencoded')) {
    ctx.request.body = parse(reqText);
  }

  // console.log({ reqBody: ctx.request.body, reqText, type: ctx.request.type });
  await next();
}
