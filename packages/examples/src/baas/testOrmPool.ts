import {  getDebug } from '@ncf/microkernel';
import { createConnection } from "typeorm";
import { ormconfig } from './ormconfig';

const debug = getDebug(module);

type PoolNames = 'postgis' | 'postgresmac';

// 一旦本模块加载，就立即创建连接池
createConnection(ormconfig.find(c => (c.name === 'postgis'))!).then(() => {
  debug('postgis typeorm connection created');
});

