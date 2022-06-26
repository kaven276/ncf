import { getDebug } from '@ncf/microkernel';
import type { SqlModue } from './SqlModule';
import { Module } from 'module';
import { loaderPostgresSQL } from './sqlToFaas';
export { cfgPgConnection } from './config';

const debug = getDebug(module);

//@ts-ignore
Module._extensions['.sql'] = function loadPGSQL(m: any, filename: string) {
  debug(filename);
  // process.exit(2);
  const loadingPromise: Promise<SqlModue> = loaderPostgresSQL(filename, filename, {}).then(sqlModule => {
    // Object.assign(m.export, sqlModule);
    return sqlModule;
  });

  m.exports = {
    // 第一次执行 faas，需要等待模块加载，然后 .faas 会被替换掉，无需等待
    faas: async (req: any) => {
      const sqlModule = await loadingPromise;
      debug('first execute sql, wait for load', filename);
      return sqlModule.faas!(req);
      // return { test: 'ok' }
    },
  }
}
