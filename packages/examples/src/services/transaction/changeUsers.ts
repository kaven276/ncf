import { User, UserRole } from "src/entity/User";
import { getOnlyQueryRunnerForTx } from 'src/baas/typeorm/getOnlyQueryRunnerForTx';
import ds from 'src/baas/typeorm/test1';

interface IRequest {
  id?: User["id"],
}
/**
 * 模拟参与 service 的一个调用单元，参与了事务。
 * 可以考虑设计注解，但是并没有什么特别的好处。
 * 对于参与事务的处理单元，统一使用 getConnFromThread(name) 获取数据库连接
 */
export async function faas(req: IRequest) {
  const id = req.id || 1;
  // 在 async thread 开始时自动进行
  const qr = await getOnlyQueryRunnerForTx(ds);
  const userRepo = qr.manager.getRepository(User);
  const ly = await userRepo.findOneBy({ firstName: 'LiYong' });

  if (ly) {
    // console.log('ly', ly);
    ly.age++;
    ly.role = UserRole.EDITOR;
    ly.likes = (Math.random() > 0.5) ? ly.likes : ['足球', '爬山'];
    ly.likes?.push(String(Math.random()).substring(0, 6));
    ly.profile = {
      name: '安德范',
      nickname: 'kiv',
    };
    await userRepo.save(ly);
  }

  const user1 = await userRepo.findOneBy({ id });
  if (user1) {
    user1.age++;
    user1.role = UserRole.GHOST;
    user1.fetech = "react";
    await userRepo.save(user1);
  }

  return { ly, user1 };
}
