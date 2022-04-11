import { getProxiedPath, getCallState } from '@ncf/microkernel';
import fetch from 'node-fetch';

const ITEM_URL = 'http://10.36.134.58:8008';

/** 目录模块导出 faas 代表该目录路径使用反向代理 */
export async function faas(req: any) {
  const targetPath = getProxiedPath();
  const ctx = getCallState();
  if (ctx.gw.gwtype !== 'koa') return;
  const httpReq = ctx.gw.http.req;
  const method = httpReq.method;
  const url = new URL(httpReq.url!, ITEM_URL);
  const targetUrl = ITEM_URL + targetPath + url.search;
  // return { method, targetUrl };
  return fetch(targetUrl, {
    method,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).then(resp => (method === 'POST') ? resp.text() : resp.json())
}
