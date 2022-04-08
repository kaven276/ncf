import { IncomingMessage } from 'http';
import Koa from 'koa';
import koaBody from 'koa-body';
import { execute, getDebug, ServiceError, GwKoa } from '@ncf/microkernel';
import { URL } from 'url';
import { Readable } from 'node:stream';

const debug = getDebug(module);

interface ISuccessResponse {
  status: number,
  /** 服务处理成功为0 */
  code: 0,
  /** 服务处理的响应数据 */
  data?: any,
}

interface IFailureResponse {
  status: number,
  /** 服务处理失败，值不为 0 */
  code: number,
  /** 伴随异常需要返回给人看的异常信息文字 */
  msg: string,
  /** 其他伴随信息，调用方可能用到 */
  data?: any,
}

/** 提供给各种接入 gateway 使用的响应。核心永远不会 throw 异常，必须返回这个规格的数据 */
type IFinalResponse = ISuccessResponse | IFailureResponse;


/*
* 选 KOA 而非裸 nodejs http 的原因
* body parse
* cookie parse/gen
* special header get/set for ts support and easiness
* error fallback
*/

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
    await next();
  }
}

/** KOA 中间件，支持到 NCF core 的调用，NCF 架构网关 */
function useNCF() {
  return async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>) => {
    // debug('request', [ctx.method, ctx.request.body, ctx.request.query]);

    const req = ctx.req;
    const method = ctx.request.method.toLocaleUpperCase();
    if (method === 'HEAD') {
      return;
    }
    // 动态根据访问路径找到对应的处理 ts 文件
    const url = new URL(ctx.url!, `http://${req.headers.host}`);
    const faasPath = url.pathname;
    const mock = !!url.searchParams.get('mock');
    const isGet = (method === 'GET');
    let request: any;
    let stream: IncomingMessage | undefined;
    if (isGet) {
      // debug('is GET');
      request = ctx.request.query;
    } else {
      if (!ctx.request.body || (ctx.request.body && Object.values(ctx.request.body).length === 0)) {
        request = ctx.request.query;
        stream = req;
        // debug('found stream');
      } else {
        // debug(' = ctx.request.body');
        // request = Object.assign({}, ctx.request.body, ctx.request.query);
        request = ctx.request.body;
      }
    }

    if (ctx.request.files) {
      Object.assign(request, { files: ctx.request.files });
    }

    let result: any;
    try {
      // 给核心服务环境信息，然后调用
      result = await execute({ faasPath, request, stream, mock }, {
        gwtype: 'koa',
        http: {
          req: ctx.req,
          res: ctx.res,
        },
        ctx,
      } as GwKoa);
    } catch (e) {
      if (e instanceof ServiceError) {
        const status = (e.code >= 100 && e.code <= 999) ? e.code : 500;
        ctx.response.status = status;
        ctx.response.set('content-type', 'application/json');
        ctx.body = { status, code: e.code, msg: e.message, data: e.data };
        return;
      }
      throw e; // 如果不是 ncf 异常，则直接重新抛出，由 koa 处理
    }

    // 如果返回的内容是 html 则直接返回页面
    if (typeof result === 'string' && result.startsWith('<')) {
      ctx.body = result;
      ctx.response.set('content-type', 'text/html;charset=utf-8');
      ctx.response.status = 200;
    } else if (result instanceof Readable) {
      ctx.body = result;
      // ctx.response.set('content-type', 'text/html;charset=utf-8');
      ctx.response.status = 200;
    } else {
      ctx.body = { code: 0, data: result };
      ctx.response.set('content-type', 'application/json');
      ctx.response.status = 200;
    }

    // console.log('final response', result.status, ctx.status, ctx.response.status, ctx.response.headers);
  }
}

export function createKoaApp() {
  const koa = new Koa();
  koa.use(useCors());
  koa.use(koaBody({
    // strict: true,
    patchKoa: true,
    multipart: true,
    formLimit: '2M',
    formidable: {
      uploadDir: process.cwd() + '/upload',
    }
  }));
  koa.use(useNCF());

  koa.on('error', (err, ctx) => {
    console.error('koa error', err);
    ctx.status = 500;
    ctx.body = {
      status: 500,
    };
  });

  return koa;
}
