import { DataSource, type DataSourceOptions, QueryRunner } from 'typeorm';
import { getDebug, resolved } from '@ncf/microkernel';
import { getQueryRunnerTx } from './getQueryRunnerTx';

const debug = getDebug(module);

declare module 'typeorm' {
  interface DataSource {
    getQueryRunnerTx: () => Promise<QueryRunner>,
  }
}

export function createDataSource(dsOptions: DataSourceOptions) {
  return resolved<DataSource>(async (addDisposer) => {
    const dataSource = new DataSource(dsOptions);
    await dataSource.initialize();
    dataSource.getQueryRunnerTx = () => getQueryRunnerTx(dataSource);
    addDisposer(async () => {
      debug(`DataSource destroying ${dsOptions.type}`,);
      if (dataSource && dataSource.isInitialized) {
        dataSource.destroy();
      }
    });
    return dataSource;
  });
}
