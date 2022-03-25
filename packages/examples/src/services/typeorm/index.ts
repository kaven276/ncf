import { IConfig } from '@ncf/microkernel';
import { setTypeormConnectionConfigs, setTypeormDefaultPoolName } from '@ncf/baas-typeorm';
import { ormconfig, PoolNames } from '../../../ormconfig';


export const config: IConfig = {
  ...setTypeormConnectionConfigs(ormconfig),
  ...setTypeormDefaultPoolName<PoolNames>('test1'),
}
