import { getConnFromThread } from 'src/lib/transaction';
import { User } from "src/entity/User";
import { ServiceError } from 'src/lib/registry';

/**
 * 模拟参与 service 的一个调用单元，参与了事务。
 * 可以考虑设计注解，但是并没有什么特别的好处。
 * 对于参与事务的处理单元，统一使用 getConnFromThread(name) 获取数据库连接
 */
export async function testTransactionQueryRunner(id: number) {
  // 在 async thread 开始时自动进行
  const queryRunner = await getConnFromThread('postgis');
  const manager = queryRunner.manager;
  const ly = await manager.findOne(User, { where: { firstName: 'LiYong' } });

  ly.age++;
  await manager.save(ly);
  ly.age++;
  await manager.save(ly);

  if (Math.random() < 0.25) {
    throw new ServiceError(1, '随机制造的异常!');
  }
  return { id }
}


/** 模拟一个对外部的服务，需要注册到服务清单，来方便将请求映射到服务 */
export async function faas() {
  const list = [];
  list.push(await testTransactionQueryRunner(1));
  list.push(await testTransactionQueryRunner(2));
  return list;
}
