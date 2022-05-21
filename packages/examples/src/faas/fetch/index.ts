import { getProxiedPath, getCallState } from '@ncf/microkernel';

const TARGET_SITE = 'https://blitzjs.com';

// 测试 curl http://localhost:8000/fetch/docs/postgres
// 测试 curl http://localhost:8000/fetch/docs/blitz-pivot

/** 目录模块导出 faas 代表该目录路径使用反向代理 */
export async function faas() {
  const targetPath = getProxiedPath();
  const ctx = getCallState();
  if (ctx.gw.gwtype !== 'koa') return;
  const httpReq = ctx.gw.http.req;
  const method = httpReq.method;
  const url = new URL(httpReq.url!, TARGET_SITE);
  const targetUrl = TARGET_SITE + targetPath + url.search;
  // return { method, targetUrl, nodeVersion: process.version };
  return fetch(targetUrl).then(resp => resp.text())
}
