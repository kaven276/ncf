import { User, UserRole } from "src/entity/User";
import { getOnlyQueryRunnerForTx } from 'src/baas/typeorm/getOnlyQueryRunnerForTx';
import ds from 'src/baas/typeorm/test1';

/**
 * 模拟参与 service 的一个调用单元，参与了事务。
 * 可以考虑设计注解，但是并没有什么特别的好处。
 * 对于参与事务的处理单元，统一使用 getConnFromThread(name) 获取数据库连接
 */
export async function faas() {

  // 在 async thread 开始时自动进行
  const qr = await getOnlyQueryRunnerForTx(ds);
  const userRepo = qr.manager.getRepository(User);
  const Timber = await userRepo.findOneBy({ firstName: 'Timber' });

  if (Timber) {
    // console.log('ly', ly);
    Timber.age++;
    await userRepo.save(Timber);
  }

  return Timber;
}
