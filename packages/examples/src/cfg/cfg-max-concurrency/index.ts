import { createCfgItem } from '@ncf/microkernel';

interface ConcurrencyConfig {
  /** faas 最大的同时在途执行数量 */
  maxConcurrency: number,
}

export const cfgMaxConcurrency = createCfgItem<ConcurrencyConfig>(Symbol('ConcurrencyThreshold'), {
  maxConcurrency: 1000,
});
