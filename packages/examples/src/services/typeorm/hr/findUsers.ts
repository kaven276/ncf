import { User, UserRole } from "src/entity/User";
import { getDataSource } from '@ncf/baas-typeorm';
import { IsNull, LessThan, MoreThan } from "typeorm";

interface IRequest {
  sex?: User["sex"],
  showNames?: boolean;
  onlyFirstName?: string,
}
/**
 * 完整测测试 ORM find 参数，包括
 * 1) select/where/order
 * 2) relation 的 select/where/order
 * 3) take, skip
 * 4) dynamic query/sql
 */
export async function faas(req: IRequest) {
  // 在 async thread 开始时自动进行
  const ds = await getDataSource();
  const userRepo = ds.getRepository(User);
  return await userRepo.find({
    relations: {
      org: false,
    },
    select: {
      names: req.showNames,
      firstName: true,
      lastName: true,
      age: false,
      profile: {
        name: false,
        nickname: true,
      },
      org: {
        orgName: true,
      },
      sex: req.sex === 'male', // 动态 sql 在 select 字段上的范例
    },
    where: [{
      age: LessThan(30),
    }, {
      age: MoreThan(50),
    }, {
      lastName: IsNull(),
      sex: req.sex,
      firstName: req.onlyFirstName,
    }],
    order: {
      age: 'desc',
    },
    skip: 0,
    take: 20,
  });
}
