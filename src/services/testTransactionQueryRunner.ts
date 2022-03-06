import { getConnFromThread } from 'src/lib/transaction';
import { User } from "src/entity/User";

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
  // throw new Error('rollback');
  // await queryRunner.rollbackTransaction();

  // 在 async thread 结束时自动执行
  // await queryRunner.commitTransaction();
  return { id }
}


/** 模拟一个对外部的服务，需要注册到服务清单，来方便将请求映射到服务 */
export async function service() {
  const list = [];
  list.push(await testTransactionQueryRunner(1));
  list.push(await testTransactionQueryRunner(2));
  return {
    code: 0,
    data: list,
  }
}
