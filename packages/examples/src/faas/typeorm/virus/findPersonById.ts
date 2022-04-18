import { People } from "entity/virus/People";
import type { Person } from 'entity/virus/types';
import ds from '.';

/** 按照身份证号新冠管理的人员信息 */
export const faas = async (req: Pick<Person, 'id'>) => {
  console.log(0);
  console.log(1);
  const repo = ds.getRepository(People);
  console.log(2);
  const found = await repo.findOneBy({ id: req.id });
  console.log(3);
  return found;
};
