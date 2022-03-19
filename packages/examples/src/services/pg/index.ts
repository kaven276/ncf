import { IConfig } from '@ncf/microkernel';
import { setPoolName } from '../../baas/testPgPool';

export const config: IConfig = {
  ...setPoolName('test'),
}
