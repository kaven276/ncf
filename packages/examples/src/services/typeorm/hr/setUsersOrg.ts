// 随机找些 user 分配 Org

import { User } from "src/entity/User";
import { Org } from "src/entity/Org";
import ds from '.';

/** 插入初始演示测试用组织数据 */
export const faas = async (req: undefined) => {
  const userRepo = ds.getRepository(User);
  const orgRepo = ds.getRepository(Org);

  const users = await userRepo.find();
  const orgs = await orgRepo.find();

  const usersWithAddedOrg: User[] = [];
  users.forEach(user => {
    if (Math.random() < 0.3) {
      if (user.org) {
        // user.org = null;
      } else {
        const selectedOrgIdx = Math.floor(Math.random() * orgs.length);
        user.org = orgs[selectedOrgIdx];
        userRepo.save(user);
        usersWithAddedOrg.push(user);
      }
    }
  });

  return usersWithAddedOrg;
};
