import { getDataSource } from '@ncf/baas-typeorm';

interface IRequest {
  tableName?: string
}
/**
 * 完整测测试 ORM find 参数，包括
 * 1) select/where/order
 * 2) relation 的 select/where/order
 * 3) take, skip
 * 4) dynamic query/sql
 */
export async function faas(req: IRequest) {
  // 在 async thread 开始时自动进行
  const ds = await getDataSource();
  const qs = ds.createQueryRunner();
  return await qs.getTable(req.tableName ?? 'user2');
}
