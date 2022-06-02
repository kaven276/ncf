import { outerCall } from '@ncf/microkernel';
import { scheduleJob } from 'node-schedule';
import { ISpec } from 'src/faas/composite/later/order.spec';

export const job = scheduleJob('fake orders', '*/5 * * * * *', () => {
  outerCall<ISpec>('/later/order', {
    productId: 'ncf',
    amount: Math.round(Math.random() * 3),
    userId: 'LiYong',
  });
});

// 查看下次待执行时间，检查是否是在本时区计算的
// console.log(job.nextInvocation());
