import { IConfig } from '@ncf/microkernel';
import { setRandomLatencyConfig } from 'src/mw/randomLatency';

export const config: IConfig = {
  ...setRandomLatencyConfig({ maxLatencyMs: 0 }),
}
