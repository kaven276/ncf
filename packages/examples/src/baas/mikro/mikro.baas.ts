import { MikroORM } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'; // or any other driver package
import { getDebug, resolved } from '@ncf/microkernel';
import { Client } from './entity/client';

const debug = getDebug(module);


export function createDataSource() {
  return resolved<MikroORM<PostgreSqlDriver>>(async (addDisposer) => {

    const orm = await MikroORM.init<PostgreSqlDriver>({
      baseDir: __dirname,
      entities: ['../../../dist/baas/mikro/entity'], // path to our JS entities (dist), relative to `baseDir`
      entitiesTs: ['entity', Client], // path to our TS entities (src), relative to `baseDir`
      user: 'ncf',
      password: 'ncf2022',
      host: '127.0.0.1',
      port: 5432,
      dbName: 'postgres',
      schema: 'expr',
      type: 'postgresql',
    });
    console.log(orm.em); // access EntityManager via `em` property
    await orm.connect();


    addDisposer(async () => {
      debug(`DataSource destroying `,);
      orm.close();
    });
    return orm;
  });
}

/** 创建并初始化好的连接池，使用者直接 ts import 即可，不用关系创建和初始化工作 */
let baas = createDataSource();

export default baas;
