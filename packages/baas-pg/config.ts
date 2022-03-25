import type { PoolConfig } from 'pg';
import { Pool } from 'pg';
import { getConfig, getDebug, throwServiceError } from '@ncf/microkernel';

/** 按照名称记录每个已创建的连接池 */
const poolMap = new Map<string, Pool>();

const debug = getDebug(module);

const configKey = Symbol('pg-connections-config');

/** 按照各个名称对应到 pg pool 的配置 */
export interface PgPoolConfigMap {
  [name: string]: PoolConfig,
}

/** 配置 pg 的连接池配置，数组 */
export function setPgPoolConfigs(configs: PgPoolConfigMap) {
  return {
    [configKey]: configs,
  }
}

/** 按照指定名称获取连接池的连接，如果连接池为建立则根据连接池配置 dir config 自动线建立 */
export function getPool(name: string = getDefaultPoolName()): Pool {
  let pool: Pool | undefined = poolMap.get(name);
  if (!pool) {
    const poolConfig: PoolConfig | undefined = getConfig(configKey)[name];
    if (!poolConfig) {
      throwServiceError(500, `pg pool ${name} connect config is not exist!`);
    }
    pool = new Pool(poolConfig);
    poolMap.set(name, pool);
  }
  return pool;
}

const poolnameKey = Symbol('pg pool name');

/** 配置 typeorm 默认使用哪个连接池 */
export function setPgDefaultPoolName<T extends string = string>(poolname: T) {
  return {
    [poolnameKey!]: poolname,
  }
}

/** 获取目录配置中默认的连接池名称 */
export function getDefaultPoolName(): string {
  return getConfig(poolnameKey) || 'default';
}
