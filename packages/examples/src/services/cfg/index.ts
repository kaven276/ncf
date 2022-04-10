import { IConfig } from '@ncf/microkernel';
import { setRandomLatencyConfig } from 'src/middlewares/randomLatency';

export const config: IConfig = {
  ...setRandomLatencyConfig({ maxLatencyMs: 0 }),
}
