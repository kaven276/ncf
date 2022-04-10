import { DataSource, type DataSourceOptions, QueryRunner } from 'typeorm';
import { getDebug, resolved } from '@ncf/microkernel';
import { getOnlyQueryRunnerForTx } from './getOnlyQueryRunnerForTx';

const debug = getDebug(module);

declare module 'typeorm' {
  interface DataSource {
    getConnectionTx: () => Promise<QueryRunner>,
  }
}

export function createDataSource(dsOptions: DataSourceOptions) {
  return resolved<DataSource>(async (addDisposer) => {
    const dataSource = new DataSource(dsOptions);
    await dataSource.initialize();
    dataSource.getConnectionTx = () => getOnlyQueryRunnerForTx(dataSource);
    addDisposer(async () => {
      debug(`DataSource destroying ${dsOptions.type}`,);
      if (dataSource && dataSource.isInitialized) {
        dataSource.destroy();
      }
    });
    return dataSource;
  });
}
