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
export async function getConnection(name: string): Promise<Connection> {
  const ormconfig: ConnectionOptions[] = getConfig(configKey);
  if (!connectionManager.has(name)) {
    await createConnection(ormconfig.find(c => (c.name === name))!).then(() => {
      debug(`${name} typeorm connection created`);
    });
  }
  return getConnectionOrigin(name);
}
