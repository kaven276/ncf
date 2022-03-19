import { IncomingMessage } from 'http';
import Koa from 'koa';
import koaBody from 'koa-body';
import { execute } from './executor';
import { URL } from 'url';

/*
* 选 KOA 而非裸 nodejs http 的原因
* body parse
* cookie parse/gen
* special header get/set for ts support and easiness
* error fallback
*/

const PORT = 8081;


/** KOA 中间件，配置服务的网站，支持其跨域 cors 访问 */
function useCors(allowedOrigin?: string) {
  return async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, next: Koa.Next) => {
    ctx.set("Access-Control-Allow-Origin", allowedOrigin || ctx.request.headers.origin || '*');
    ctx.set("Access-Control-Allow-Credentials", "true");
    if (ctx.method === 'OPTIONS') {
      // console.log('OPTIONS req headers', ctx.request.headers);
      ctx.status = 200;
      ctx.set('Access-Control-Max-Age', '86400');
      ctx.set('access-control-allow-methods', 'POST,GET,OPTIONS');
      const h = ctx.request.headers["access-control-request-headers"];
      if (h) {
        ctx.set("Access-Control-Allow-Headers", h);
      }
      // console.log(ctx.response.headers);
      return;
    }
    const reqBody = ctx.request.body;
    // console.log('prelog -----', ctx.request.method, reqBody instanceof buffer, reqBody instanceof String, ctx.origin, ctx.request.headers);
    await next();
  }
}

/** KOA 中间件，支持到 NCF core 的调用，NCF 架构网关 */
function useNCF() {
  return async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>) => {
    // debug('buffer -----', [ctx.method, ctx.request.body, ctx.request.query]);

    const req = ctx.req;
    // 动态根据访问路径找到对应的处理 ts 文件
    const url = new URL(ctx.url!, `http://${req.headers.host}`);
    const faasPath = url.pathname;
    const mock = !!url.searchParams.get('mock');
    const isPost = ctx.request.method.toLocaleUpperCase() === 'POST';
    const request = ctx.request.body || ctx.request.query;

    let stream: IncomingMessage | undefined;
    if (isPost && !ctx.request.body) {
      stream = ctx.req;
      // console.log('found stream');
    }

    // 给核心服务环境信息，然后调用
    const result = await execute({
      faasPath, request, stream, mock, http: {
        req: ctx.req,
        res: ctx.res,
      }
    });
    ctx.response.type = 'application/json';
    ctx.body = result;
    // console.log('ctx.body', ctx.body);
    ctx.response.set('content-type', 'application/json');
    ctx.response.status = result.status || 200;
    // console.log('final response', result.status, ctx.status, ctx.response.status, ctx.response.headers);
  }
}


function startServer() {

  const koa = new Koa();
  koa.use(useCors());
  koa.use(koaBody({}));
  koa.use(useNCF());

  koa.on('error', (err, ctx) => {
    ctx.status = 500;
    ctx.body = {
      status: 500,
    };
  });

  koa.listen(PORT);
}


export async function start() {
  startServer();
}
