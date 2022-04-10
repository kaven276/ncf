import { People } from "entity/virus/People";
import type { Person } from 'entity/virus/types';
import { getDataSource } from '@ncf/baas-typeorm';

/** 登记新冠管理的人员信息 */
export const faas = async (req: Person) => {
  // const two = new People(); // 使用 EntitySchema 创建的不是 class 无法 new
  const ds = await getDataSource();
  const repo = ds.getRepository(People);
  const one = repo.create(req);
  const saved = await repo.save(one);
  return saved;
};
