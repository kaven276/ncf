import { User } from "src/entity/User";
import ds from 'src/baas/typeorm/test1.baas'; // 通常 faas 模块不会直接引用提供 baas 的模块，因为不方便批量修改

/** 直接 import baas 模块，好处是直接方便，无需间接引用步骤 */
export async function faas(req: any) {
  const userRepo = ds.getRepository(User);
  return await userRepo.find({ skip: 0, take: 3 });
}
