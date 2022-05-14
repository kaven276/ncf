import { ISpec } from './order.spec';
import { innerCall } from '@ncf/microkernel';

export const faas = async () => {
   return innerCall<ISpec>('/later/order', {
     userId: 'LiYong',
     productId: 'macbook16',
     amount: 1,
   });
}

import tap from 'tap';
/** 如果是顶层模块，认为是要测试任务 */
export const task = (require.main === module) && tap.test('order', async (t) => {
  await faas();
});
