import { IConfig } from '@ncf/microkernel';
import { setTypeormConnectionConfigs, setTypeormDefaultPoolName } from '@ncf/baas-typeorm';
import { ormconfig, PoolNames } from '../../baas-config/ormconfig';

export { baas as getDataSource } from 'src/bass/typeorm/test1';

export const config: IConfig = {
  ...setTypeormConnectionConfigs(ormconfig),
  ...setTypeormDefaultPoolName<PoolNames>('test1'),
}
