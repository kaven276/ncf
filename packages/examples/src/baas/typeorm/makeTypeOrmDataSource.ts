import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import { getDebug, useLifecycle } from '@ncf/microkernel';

const debug = getDebug(module);

/** 根据连接池配置，可以创建一个管理器对象，用于 NCF 创建和初始化连接池还有注册关闭连接池函数 */
export function lifecycle(m: NodeModule, dsOptions: DataSourceOptions): DataSource {
  return useLifecycle<DataSource>(m, {
    /* ncf 确保一个 BAAS 连接池只被创建和初始化一次 */
    async initialize() {
      const baas = new DataSource(dsOptions);
      await baas.initialize();
      debug('ds type check', baas instanceof DataSource);
      return baas;
    },

    /** hotUpdate 时，或者进程退出时，将会被系统自动执行，正常的清理资源 */
    async destroy(baas: DataSource) {
      if (baas && baas.isInitialized) {
        // console.info('test1 baas typeorm pool destroying...')
        await baas.destroy();
      }
    },
  });
}
