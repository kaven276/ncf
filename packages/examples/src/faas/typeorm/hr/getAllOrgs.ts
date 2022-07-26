import { Org } from "entity/Org";
import ds from '.';
import { Raw } from 'typeorm';

/** 插入初始演示测试用组织数据 */
export const faas = async (req: undefined) => {
  const orgRepo = ds.getRepository(Org);
  // return 12;
  const orgs = await orgRepo.count({
    where: {
      orgName: Raw((a) => `${a} ilike '亚信d%'`)
    }
  });
  return orgs;
};
