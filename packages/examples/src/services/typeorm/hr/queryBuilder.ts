import ds from '.';
import { User } from "src/entity/User";

interface IRequest {
  id?: User["id"],
}

/** raw query 方式查询，simple_array/json 等类型都没有解析，都是字符串，不如使用 find, QueryBuild */
export const faas = async (req: IRequest) => {
  // return req;
  const userRepo = ds.getRepository(User);
  const result = await userRepo.createQueryBuilder('user')
    .where('user.id = :userId', { userId: req.id })
    .getMany();
  return result;
};
