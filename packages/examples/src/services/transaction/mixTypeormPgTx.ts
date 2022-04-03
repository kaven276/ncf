import { throwServiceError } from '@ncf/microkernel';
import { faas as mixPgBranch } from './mixPgBranch';
import { faas as mixTypeormBranch } from './mixTypeormBranch';

/** 跨 typeorm 和 pg 的事务范例 */
export async function faas() {
  // 这里演示主服务可以并发调用多个子分支
  const result = await Promise.all([
    mixPgBranch(),
    mixTypeormBranch(),
  ]);
  if (Math.random() < 0.3) {
    throwServiceError(500, '事务处理中发生异常，需要回退');
  }
  return result;
}
