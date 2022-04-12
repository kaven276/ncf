import { getConfig } from '@ncf/microkernel';

const configKey = Symbol('ConcurrencyThreshold');

export interface ConcurrencyConfig {
  /** faas 最大的同时在途执行数量 */
  maxConcurrency: number,
}

const defaultConfig: ConcurrencyConfig = {
  maxConcurrency: 1000,
}

export function setMaxConcurrencyConfig(cfg: ConcurrencyConfig) {
  return {
    [configKey!]: cfg
  }
}

export function getMaxConcurrencyConfig(): ConcurrencyConfig {
  return getConfig(configKey) ?? defaultConfig;
}
