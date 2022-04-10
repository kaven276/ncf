import { People } from "entity/virus/People";
import type { Person } from 'entity/virus/types';
import { getDataSource } from '@ncf/baas-typeorm';

/** 按照身份证号新冠管理的人员信息 */
export const faas = async (req: Pick<Person, 'id'>) => {
  console.log(0);
  const ds = await getDataSource();
  console.log(1);
  const repo = ds.getRepository(People);
  console.log(2);
  const found = await repo.findOneBy({ id: req.id });
  console.log(3);
  return found;
};
