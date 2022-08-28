import type { DataSourceOptions } from 'typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { getDebug, resolved } from '@ncf/microkernel';



const debug = getDebug(module);

export function createDataSource(dsOptions: DataSourceOptions) {
  return resolved<DataSource>(async (addDisposer) => {
    const dataSource = new DataSource(dsOptions);
    await dataSource.initialize();
    addDisposer(async () => {
      debug(`DataSource destroying ${dsOptions.type}`,);
      if (dataSource && dataSource.isInitialized) {
        dataSource.destroy();
      }
    });
    return dataSource;
  });
}
