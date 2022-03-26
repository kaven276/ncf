import { People } from "src/entity/virus/People";
import type { Person } from 'src/entity/virus/types';
import { getDataSource } from '@ncf/baas-typeorm';

/** 按照身份证号新冠管理的人员信息 */
export const faas = async (req: Pick<Person, 'id'>) => {
  const ds = await getDataSource();
  const repo = ds.getRepository(People);
  const found = await repo.findOneBy({ id: req.id });
  return found;
};
