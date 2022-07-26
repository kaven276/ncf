import ds from '.';
import { User } from "entity/User";
import { Org } from "entity/Org";
import { Service } from '@ncf/microkernel';

interface IRequest {
  id?: User["id"],
  rank: number,
}

interface API {
  path: '/typeorm/hr/queryBuilder',
  request: IRequest,
  response: User[],
}

/** raw query 方式查询，simple_array/json 等类型都没有解析，都是字符串，不如使用 find, QueryBuild */
export const faas: Service<API> = async (req: IRequest) => {
  // return req;
  const userRepo = ds.getRepository(User);
  const result = await userRepo.createQueryBuilder('user')
    .leftJoinAndSelect("user.org", "org")
    .where('user.id = :userId', { userId: req.id })
    .andWhere('org."rank" = :rank', { rank: req.rank })
    .getMany();
  return result;
};

faas.tests = {
  test1: {
    id: 2,
    rank: 1,
  }
}
