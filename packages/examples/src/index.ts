import { createRequestListener } from '@ncf/microkernel';
import { createKoaApp } from '@ncf/gateway-koa';
import { createServer } from 'http';
// import '@ncf/loader-cfg-json5';
// import '@ncf/loader-cfg-yaml';
// import '@ncf/loader-cfg-xml';
// import '@ncf/loader-cfg-markdown';
// import '@ncf/loader-sql-pg';
import { env } from './env';

// 作为应用模块使用，不被 import/require，否则退出
if (require.main !== module) {
  process.exit()
}

// 使用多个 NCF app 接入层，分别监听不同的端口
const server1 = createServer(createKoaApp().callback()).listen(env.PORT);
const server2 = createServer(createRequestListener()).listen(env.PORT + 1);

process.once('SIGINT', () => {
  server1.close();
  server2.close();
});
