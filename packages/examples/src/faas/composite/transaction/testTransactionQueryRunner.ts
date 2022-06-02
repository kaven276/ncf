import { ServiceError } from '@ncf/microkernel';
import { faas as testTransactionQueryRunner } from './changeUsers';

/** 模拟一个对外部的服务，需要注册到服务清单，来方便将请求映射到服务 */
export async function faas() {
  const list = [] as any[];
  list.push(await testTransactionQueryRunner({ id: 1 }));
  list.push(await testTransactionQueryRunner({ id: 3 }));
  if (Math.random() < 0.25) {
    throw new ServiceError(1, '随机制造的异常!');
  }
  return list;
}
