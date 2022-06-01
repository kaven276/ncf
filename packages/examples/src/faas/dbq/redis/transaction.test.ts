import { innerCall } from '@ncf/microkernel';
import type { ISpec, IRequest } from './transaction.spec'

/** 测试直接使用 pg 单个连接提供服务 */
export const faas = async () => {
  return innerCall<ISpec>('/redis/transaction');
}
