import { cfgLatency } from 'src/mw/randomLatency';

export const config = {
  ...cfgLatency.set({ maxLatencyMs: 0 }),
}
