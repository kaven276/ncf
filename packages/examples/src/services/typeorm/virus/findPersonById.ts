import { People } from "src/entity/virus/People";
import type { Person } from 'src/entity/virus/types';
import { getConnection } from '@ncf/baas-typeorm';

/** 按照身份证号新冠管理的人员信息 */
export const faas = async (req: Pick<Person, 'id'>) => {
  const c = await getConnection();
  const r = c.getRepository(People);
  const found = await r.findOne(req.id);
  return found;
};

