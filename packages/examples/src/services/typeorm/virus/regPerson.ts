import { People } from "src/entity/virus/People";
import type { Person } from 'src/entity/virus/types';
import { getConnection } from '@ncf/baas-typeorm';

/** 登记新冠管理的人员信息 */
export const faas = async (req: Person) => {
  const c = await getConnection();
  const r = c.getRepository(People);
  const one = r.create(req);
  const saved = await r.save(one);
  return saved;
};
