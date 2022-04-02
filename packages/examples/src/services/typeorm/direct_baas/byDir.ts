import { User } from "src/entity/User";
import ds from '.'; // 因此通过目录模块统一指向连接池模块

/** 通过父级目录导出获取 baas 对象，好处是可以在目录上统一进行替换，而不用修改每一处的 faas 模块 import 代码 */
export async function faas(req: any) {
  const userRepo = ds.getRepository(User);
  return await userRepo.find({ skip: 0, take: 3 });
}
