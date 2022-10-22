import { IConfig } from '@ncf/microkernel';
import { cfgStitchesConfig } from '@ncf/mw-react-server-render';
import * as stitchesConfig from './stitches.config';

export const config: IConfig = {
  ext: '.tsx',
  ...cfgStitchesConfig.set(stitchesConfig)
}
