import type { DataSourceOptions } from 'typeorm';
import { DataSource, QueryRunner } from 'typeorm';
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
    // 对于 postgres 数据库，自动配置 set search_path to 参数中的 schema
    if (dsOptions.type === 'postgres') {
      const db = dataSource;
      const queryRunner = db.createQueryRunner();
      const proto = Object.getPrototypeOf(queryRunner);
      const { connect } = proto;
      proto.connect = async function connectWithSearchPath(...args: any[]) {
        const connection = await connect.apply(this, args);
        if (!connection._hasSet) {
          connection._hasSet = true; // 保证每个实际创建的 connection 只执行一次 set search_path，不重复
          await connection.query(`set search_path to ${dsOptions.schema},public`);
        }
        return connection;
      }
    }

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
