import { IConfig } from '@ncf/engine';
import { setPoolName } from '../../baas/testPgPool';

export const config: IConfig = {
  ...setPoolName('echarts'),
}
