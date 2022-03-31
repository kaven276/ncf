// 纯 ts 方式引用

import { User } from "src/entity/User";
import { getOrmDs } from 'src/bass/typeorm/getOrmDs';

interface IRequest {
}
/**
 * 测试全 typescript 方式获取 typeorm 连接池
 */
export async function faas(req: IRequest) {
  // 在 async thread 开始时自动进行
  const ds = await getOrmDs("test3");
  const userRepo = ds.getRepository(User);
  return await userRepo.find({
    comment: 'test typeorm find options',
    relations: {
      org: true,
    },
    order: {
      age: 'desc',
    },
    skip: 0,
    take: 20,
  });
}
