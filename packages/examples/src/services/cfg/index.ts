import { IConfig } from '@ncf/microkernel';
import { setRandomLatencyConfig } from 'src/middleware/randomLatency';

export const config: IConfig = {
  ...setRandomLatencyConfig({ maxLatencyMs: 0 }),
}
