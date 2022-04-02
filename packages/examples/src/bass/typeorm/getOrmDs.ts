/**
 * 范例说明：
 * 多 DataSource 管理模块通过 () => import() lazy 方式持有分布在各个文件中的连接池
 * getOrmDs 的参数连接池名称类型被限定为已有定义的连接池名称，提供代码提示和校验的能力
 * 但是连接池名称上面没有 ts 支持，不会带出 creators 中 key 的说明，也不提供导航到具体哪个连接池模块文件的能力
 * 动态加载 baas 模块后，需要补上 registerDynamicBaas 注册到 ncf，同时实现 baas 的初始化
 * 对于分库的场景，比如按照用户所属地区分库。可以提供 getter 函数，根据 JWT 中用户区域信息动态的选择用哪个数据库。
 * 但是，动态加载 BAAS 模块，可能无法支持热更新。
 * 因此，尽量使用静态方式 import BAAS 模块，写法也更加的简单
 */

import { BassModule, registerDynamicBaas } from '@ncf/microkernel';
import { DataSource } from 'typeorm';
import * as baasTest2 from './test2';

const creators = {
  test1: () => import(`./test1`).then(() => registerDynamicBaas(require.resolve('./test1.ts'))),
  test2: () => Promise.resolve(baasTest2),
  test3: () => import(`./test3`).then(() => registerDynamicBaas(require.resolve('./test3.ts'))),
}

export async function getOrmDs(name: keyof typeof creators = 'test1'): Promise<DataSource> {
  let bm: BassModule<DataSource> = await creators[name]()
  // console.log(bm, bm.default);
  return bm.default;
}
