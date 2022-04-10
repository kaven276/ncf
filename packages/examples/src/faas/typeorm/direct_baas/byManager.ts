import { User } from "entity/User";
import { getOrmDs, DsName } from 'src/baas/typeorm/getOrmDs';

interface IRequest {
  dsname: DsName,
}

/** 通过 baas manager getter 函数根据请求参数动态获取 baas，可用于分库存储的场景 */
export async function faas(req: IRequest) {
  const ds = await getOrmDs(req.dsname ?? 'test2');
  const userRepo = ds.getRepository(User);
  return await userRepo.find({ skip: 0, take: 3 });
}
