import { createKoaApp, createRequestListener } from '@ncf/microkernel';
import { createServer } from 'http';
import '@ncf/loader-cfg-json5';
import '@ncf/loader-cfg-yaml';
import '@ncf/loader-cfg-xml';
import '@ncf/loader-cfg-markdown';
import { env } from './src/env';

// 如果想没有访问上来就创建连接池的话，就上来就 import 下一行
import './src/baas/testOrmPool';

// 作为应用模块使用，不被 import/require，否则退出
if (require.main !== module) {
  process.exit()
}

// 使用多个 NCF app 接入层，分别监听不同的端口
createServer(createKoaApp().callback()).listen(env.PORT);
createServer(createRequestListener()).listen(env.PORT + 1);
