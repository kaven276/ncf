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
    comment: 'test typeorm find options',
    relations: {
      org: true,
    },
    select: {
      id: true,
      names: req.showNames ? true : undefined, // 需要设置为 undefined 才能去除展示该字段，其他值都相当于 true
      firstName: true,
      lastName: true,
      age: true, // order 里面出现的，这里必须配置，否则报异常 errorMissingColumn
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
