import { User } from "entity/User";
import ds from '.'; // 因此通过目录模块统一指向连接池模块

/** 登记新冠管理的人员信息 */
export const faas = async (req: undefined) => {
  // const two = new People(); // 使用 EntitySchema 创建的不是 class 无法 new
  let ly: User | null;
  await ds.transaction(async (manager) => {
    // 注意：你必须使用给定的管理器实例执行所有数据库操作，
    // 它是一个使用此事务的EntityManager的特殊实例，并且不要忘记在处理操作
    const userRepo = manager.getRepository(User);
    ly = await userRepo.findOne({ where: { firstName: 'LiYong' } });
    if (!ly) return;
    ly.age++;
    await manager.save(ly);
    ly.age++;
    await manager.save(ly);
    // throw new Error('rollback');
  });
  //@ts-ignore
  return ly;
};
