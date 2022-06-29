console.log('> require.main!.filename', require.main!.filename, process.version);
console.log('> nodejs version', process.version);

import './core';
import { createRequestListener } from '@ncf/microkernel';
import { createKoaApp } from '@ncf/gateway-koa';
import { createServer } from 'http';
import '@ncf/loader-cfg-json5';
import '@ncf/loader-cfg-yaml';
import '@ncf/loader-cfg-xml';
import '@ncf/loader-cfg-markdown';
// import '@ncf/loader-sql-pg';
import { env } from './env';
import 'src/flow';
import send from 'koa-send';
import { join } from 'node:path';
import proxy from 'koa2-proxy-middleware';

// 作为应用模块使用，不被 import/require，否则退出
if (require.main !== module && !(require.main!.filename!).endsWith('server.js')) {
  process.exit()
}


const StaticMountPoint = '/static';
const prefixLen = StaticMountPoint.length;
const StaticRootPath = join(__dirname, StaticMountPoint);
const koaApp = createKoaApp();

// curl http://localhost:8000/self/typeorm/hr/findUsers
koaApp.middleware.unshift(proxy({
  targets: {
    '/self': {
      // this is option of http-proxy-middleware
      target: 'http://localhost:8000', // target host
      changeOrigin: true, // needed for virtual hosted sites
      pathRewrite: {
        '/self': '', // rewrite path
      }
    },
  },
}));


koaApp.middleware.unshift(async (ctx, next) => {
  console.log(ctx.path, ctx.url)
  if (ctx.path.startsWith('/static')) {

    const done = await send(ctx, ctx.path.substring(prefixLen), {
      root: StaticRootPath,
      index: 'index.html',
      hidden: false,
      maxAge: 0, // 生产模式下应该开缓存，开发模式下为了看到最新版设置为0
    });
  } else {
    await next();
  }
});

// 使用多个 NCF app 接入层，分别监听不同的端口
const server1 = createServer(koaApp.callback()).listen(env.PORT, () => {
  console.log(`listening at ${env.PORT}`);
});
const server2 = createServer(createRequestListener()).listen(env.PORT + 1);

process.once('SIGINT', () => {
  server1.close();
  server2.close();
});

