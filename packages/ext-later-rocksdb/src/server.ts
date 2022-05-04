import Koa from 'koa';
import koaBody from 'koa-body';
import { LaterTaskTuple } from './spec';
import db, { random } from './db';
import { lastTick } from './executor';

/** 接受来自 NCF 的延迟调用请求信息 */
function useLater() {
  return async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>) => {
    // debug('request', [ctx.method, ctx.request.body, ctx.request.query]);

    const req = ctx.req;
    const method = ctx.request.method;
    if (method !== 'POST') {
      console.error('method', method);
      ctx.throw(400, '不是合法的请求');
    }
    // console.log(method, req.headers['x-later']);
    if (!req.headers['x-later']) {
      console.error('x-later', req.headers['x-later']);
      ctx.throw(400, '不是合法的请求');
    }
    // 动态根据访问路径找到对应的处理 ts 文件
    const requests: LaterTaskTuple[] = ctx.request.body;
    if (!requests) {
      ctx.throw(400, '没有请求体');
    }
    if (!Array.isArray(requests)) {
      ctx.throw(400, '请求必须是延迟任务数组');
    }
    console.log('requests');
    console.dir(requests);
    const tasks = requests.map(r => {
      // 如果请求者没有给定预约时间，则使用最后一次取延迟队列的时间，确保下批次处理一定能被选中执行，不使用 Date.now() 提高性能
      let dueTime: number = r[2] ?? 0;
      if (dueTime < lastTick) {
        dueTime = lastTick;
      }
      // let key: number = Math.max((r[2] ?? 0, lastTick)); // Math.max 有 bug，得到的是小的数
      // console.log([dueTime, r[2], lastTick]);
      // 1651633465955 origin r[2]
      // 1651633460216 modified lastTick
      r[2] = r[2] ?? dueTime;
      return { type: 'put' as 'put', key: String(dueTime) + random(), value: r };
    });
    // console.log('tasks');
    // console.dir(tasks);
    try {
      await db.batch(tasks);
    } catch (e) {
      console.error(e);
      ctx.throw(500, '批量写延迟任务失败');
    }
    // console.log('batch put to later queue successfully');
    ctx.status = 200;
  }
}

export function createKoaApp() {
  const koa = new Koa();
  koa.use(koaBody({
    // strict: true,
    patchKoa: true,
    multipart: false,
    text: false,
    jsonStrict: false,
  }));
  koa.use(useLater());

  koa.on('error', (err, ctx) => {
    console.error('koa error', err);
    ctx.status = 500;
  });

  return koa;
}
