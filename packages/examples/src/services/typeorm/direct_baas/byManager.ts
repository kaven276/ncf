import { User } from "src/entity/User";
import { getOrmDs } from 'src/bass/typeorm/getOrmDs';

/** 通过 baas manager getter 函数动态获取 baas */
export async function faas(req: any) {
  const ds = await getOrmDs('test3');
  const userRepo = ds.getRepository(User);
  return await userRepo.find({ skip: 0, take: 3 });
}
