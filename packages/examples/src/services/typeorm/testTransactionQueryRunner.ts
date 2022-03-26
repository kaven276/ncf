import { User, UserRole } from "src/entity/User";
import { ServiceError } from '@ncf/microkernel';
import { getConnFromThread } from '@ncf/baas-typeorm';

/**
 * 模拟参与 service 的一个调用单元，参与了事务。
 * 可以考虑设计注解，但是并没有什么特别的好处。
 * 对于参与事务的处理单元，统一使用 getConnFromThread(name) 获取数据库连接
 */
export async function testTransactionQueryRunner(id: number) {
  // 在 async thread 开始时自动进行
  const manager = (await getConnFromThread()).manager;
  const ly = (await manager.findOne(User, { where: { firstName: 'LiYong' } }));

  if (ly) {
    // console.log('ly', ly);
    ly.age++;
    ly.role = UserRole.EDITOR;
    ly.likes = (Math.random() > 0.5) ? ly.likes : ['足球', '爬山'];
    ly.likes.push(String(Math.random()).substring(0, 6));
    ly.profile = {
      name: '安德范',
      nickname: 'kiv',
    };
    await manager.save(ly);
  }

  const user1 = (await manager.findOneBy(User, { id: 1 }));
  if (user1) {
    user1.age++;
    user1.role = UserRole.GHOST;
    user1.fetech = "react";
    await manager.save(user1);
  }


  if (Math.random() < 0.25) {
    throw new ServiceError(1, '随机制造的异常!');
  }
  return { id }
}


/** 模拟一个对外部的服务，需要注册到服务清单，来方便将请求映射到服务 */
export async function faas() {
  const list = [] as any[];
  list.push(await testTransactionQueryRunner(1));
  list.push(await testTransactionQueryRunner(2));
  return list;
}