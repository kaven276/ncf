import { Org } from "src/entity/Org";
import { getDataSource } from '@ncf/baas-typeorm';

/** 插入初始演示测试用组织数据 */
export const faas = async (req: undefined) => {
  const ds = await getDataSource();
  const orgRepo = ds.getRepository(Org);

  const orgs = await orgRepo.find();
  if (orgs.length > 0) {
    return orgs; // 如果已经插入种子数据，不要再重复做了，会插入重复数据
  }

  const org1 = orgRepo.create({
    orgName: '亚信科技',
    orgId: '132.168.7.0/24',
    rank: 1,
    tags: ['IT', 'CT', 'BOSS'],
  });
  orgRepo.save(org1);

  return [org1];
};
