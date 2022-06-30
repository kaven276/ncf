import { getProxiedPath, Service, getCallState } from '@ncf/microkernel';
import { cfgLatency } from 'src/mw/randomLatency';
import { env } from 'src/env';

/** 目录模块导出 faas 代表该目录路径使用反向代理 */
export const faas: Service = async (req: any) => {
  const targetPath = getProxiedPath();
  const ctx = getCallState();
  if (ctx.gw.gwtype === 'koa') {
    // return {
    //   method: ctx.gw.ctx.method,
    //   //@ts-ignore
    //   body: ctx.gw.ctx.request.body[unparsed],
    //   targetPath,
    //   req,
    // };
    // 直接代理到自己，方便测试和演示
    // 传递的请求 headers 不能包括 hop-to-hop headers connection，否则 fetch API 报异常
    const { connection, ...headers } = ctx.gw.http.req.headers;
    // todo: 如果要跟踪原始的来源 ip，需要在 headers 注入
    return fetch(`http://localhost:${env.PORT}/typeorm${targetPath}`, {
      method: ctx.gw.ctx.method,
      //@ts-ignore
      body: ctx.gw.ctx.request.rawBody,
      //@ts-ignore
      headers,
    }).then(resp => resp.json()).then(json => json.data);
  } else {
    // 查看请求信息
    return 'not throuth gateway-koa';
  }
}

/** 说明代理模块也可以受中间及其配置影响，和实体 faas 模块一样 */
export const config = {
  ...cfgLatency.set({
    maxLatencyMs: 0,
  }),
}
