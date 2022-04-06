import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import { getDebug, resolved } from '@ncf/microkernel';

const debug = getDebug(module);

export function createDataSource(dsOptions: DataSourceOptions) {
  return resolved<DataSource>(async () => {
    const baas = new DataSource(dsOptions);
    await baas.initialize();
    return baas;
  })
}

/** hotUpdate 时，或者进程退出时，将会被系统自动执行，正常的清理资源 */
async function destroy(baas: DataSource) {
  if (baas && baas.isInitialized) {
    // console.info('test1 baas typeorm pool destroying...')
    await baas.destroy();
  }
}
