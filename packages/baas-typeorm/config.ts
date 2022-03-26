import type { DataSourceOptions } from 'typeorm';
import { getConfig, getDebug } from '@ncf/microkernel';
import { DataSource } from "typeorm";

const debug = getDebug(module);

const configKey = Symbol('typeorm-connections-config');

/** 按照名称记录每个已创建的连接池 */
const poolMap = new Map<string, DataSource>();

/** 按照各个名称对应到 pg pool 的配置 */
export interface OrmPoolConfigMap {
  [name: string]: DataSourceOptions,
}

/** 配置 typeorm 的连接池配置，数组 */
export function setTypeormConnectionConfigs(configs: OrmPoolConfigMap) {
  return {
    [configKey!]: configs,
  }
}

/** 按照指定名称获取连接池的连接，如果连接池为建立则根据连接池配置 dir config 自动线建立 */
export async function getDataSource(name: string = getDefaultPoolName()): Promise<DataSource> {
  let dataSource = poolMap.get(name);
  if (dataSource) return dataSource;

  const ormconfig: DataSourceOptions = getConfig(configKey)[name];
  dataSource = new DataSource(ormconfig);
  await dataSource.initialize();
  poolMap.set(name, dataSource);
  debug(`pool ${name} initialized and registered`);
  return dataSource;
}

const poolnameKey = Symbol('typeorm pool name');

/** 配置 typeorm 默认使用哪个连接池 */
export function setTypeormDefaultPoolName<T extends string = string>(poolname: T) {
  return {
    [poolnameKey!]: poolname,
  }
}

/** 获取目录配置中默认的连接池名称 */
export function getDefaultPoolName(): string {
  return getConfig(poolnameKey) || 'default';
}
