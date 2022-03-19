import { IConfig } from '@ncf/engine';
import { setRandomLatencyConfig } from '../../middlewares/randomLatency';

export const config: IConfig = {
  ...setRandomLatencyConfig({ maxLatencyMs: 0 }),
}
