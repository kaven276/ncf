import { startKoa } from '@ncf/engine';
import '@ncf/loader-cfg-json5';
import '@ncf/loader-cfg-yaml';
import '@ncf/loader-cfg-xml';
import '@ncf/loader-cfg-markdown';

// 作为应用模块使用，不被 import/require，否则退出
if (require.main !== module) {
  process.exit()
}
startKoa();
