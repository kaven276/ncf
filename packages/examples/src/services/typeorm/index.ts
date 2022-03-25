import { IConfig } from '@ncf/microkernel';
import { setTypeormConnectionConfigs } from '@ncf/baas-typeorm';
import { ormconfig } from '../../../ormconfig';


export const config: IConfig = {
  ...setTypeormConnectionConfigs(ormconfig),
}
