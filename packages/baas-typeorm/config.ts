import type { ConnectionOptions } from 'typeorm';
import { getConfig, getDebug } from '@ncf/microkernel';
import { Connection, createConnection, getConnection as getConnectionOrigin, getConnectionManager } from "typeorm";

const connectionManager = getConnectionManager();
const debug = getDebug(module);

const configKey = Symbol('typeorm-connections-config');

/** 配置 typeorm 的连接池配置，数组 */
export function setTypeormConnectionConfigs(configs: ConnectionOptions[]) {
  return {
    [configKey!]: configs,
  }
}

/** 按照指定名称获取连接池的连接，如果连接池为建立则根据连接池配置 dir config 自动线建立 */
export async function getConnection(name: string = getDefaultPoolName()): Promise<Connection> {
  const ormconfig: ConnectionOptions[] = getConfig(configKey);
  if (!connectionManager.has(name)) {
    await createConnection(ormconfig.find(c => (c.name === name))!).then(() => {
      debug(`${name} typeorm connection created`);
    });
  }
  return getConnectionOrigin(name);
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
