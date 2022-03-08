import { get } from 'http';
import Koa from 'koa';
import { execute } from './executor';
import { createConnection } from "typeorm";

import { URL } from 'url';

const PORT = 8081;

function startServer() {

  const koa = new Koa();
  koa.use(async ctx => {
    const req = ctx.req;
    const res = ctx.res;
    // 动态根据访问路径找到对应的处理 ts 文件
    const url = new URL(ctx.url!, `http://${req.headers.host}`);
    const faasPath = url.pathname;
    const jwtString = req.headers['authorization'] || 'anonymous';
    const sub = url.searchParams.get('user') || 'testuser';
    const mock = !!url.searchParams.get('mock');
    // const request = {...new Map(url.searchParams)};
    const request = {} as any;
    url.searchParams.forEach((value, name) => {
      request[name] = value;
    });

    // 给核心服务环境信息，然后调用
    const result = await execute({ jwtString, sub, faasPath, request, mock });
    res.setHeader('content-type', 'application/json');
    res.statusCode = result.status || 200;
    res.end(JSON.stringify(result));
  });

  koa.listen(PORT);
}


async function startAndTest() {
  await createConnection('postgis');
  startServer();
  get(`http://localhost:${PORT}/testTransactionQueryRunner`);
  await new Promise((r) => setTimeout(r, 300));
  // get(`http://localhost:${PORT}/testTransactionQueryRunner`);
}

startAndTest();
