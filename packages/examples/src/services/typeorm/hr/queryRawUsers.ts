import { getDataSource } from '@ncf/baas-typeorm';

/** raw query 方式查询，simple_array/json 等类型都没有解析，都是字符串，不如使用 find, QueryBuild */
export const faas = async (req: undefined) => {
  const ds = await getDataSource();
  const rawData = await ds.query(`SELECT * FROM "user2"`);
  return rawData;
};
