/**
 * 范例说明：
 * 多 DataSource 管理模块通过 () => import() lazy 方式持有分布在各个文件中的连接池
 * getOrmDs 的参数连接池名称类型被限定为已有定义的连接池名称，提供代码提示和校验的能力
 * 但是连接池名称上面没有 ts 支持，不会带出 creators 中 key 的说明，也不提供导航到具体哪个连接池模块文件的能力
 *
 */

import { DataSource } from 'typeorm';

interface BassModule {
  baas: () => Promise<DataSource>,
}

const creators = {
  test1: () => import(`./test1`),
  test2: () => import(`./test2`),
  /** test3 */
  test3: () => import(`./test3`),
}

export async function getOrmDs(name: keyof typeof creators = 'test1'): Promise<DataSource> {
  let ds: BassModule = await creators[name]()
  return ds.baas();
}

