import { IConfig } from '@ncf/microkernel';
import { setTypeormDefaultPoolName } from '@ncf/baas-typeorm';
import { PoolNames } from 'src/baas-config/ormconfig';

export const config: IConfig = {
  ...setTypeormDefaultPoolName<PoolNames>('test1'),
}
