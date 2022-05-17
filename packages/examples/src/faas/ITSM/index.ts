import { getProxiedPath, getCallState } from '@ncf/microkernel';
import { fetch } from '@ncf/node-fetch';
import { env } from 'src/env';

const { ITSM_URL } = env;

/** 目录模块导出 faas 代表该目录路径使用反向代理 */
export async function faas() {
  const targetPath = getProxiedPath();
  const ctx = getCallState();
  if (ctx.gw.gwtype !== 'koa') return;
  const httpReq = ctx.gw.http.req;
  const method = httpReq.method;
  const url = new URL(httpReq.url!, ITSM_URL);
  const targetUrl = ITSM_URL + targetPath + url.search;
  // return { method, targetUrl };
  return fetch(targetUrl, {
    method,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).then(resp => (method === 'POST') ? resp.text() : resp.json())
}
