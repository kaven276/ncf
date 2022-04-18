import { setRandomLatencyConfig } from 'src/mw/randomLatency';

export const config = {
  ...setRandomLatencyConfig({ maxLatencyMs: 0 }),
}
