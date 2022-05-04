import { outerCall } from '@ncf/microkernel';
import { scheduleJob } from 'node-schedule';
import { ISpec } from 'src/faas/later/order.spec';

export const job = scheduleJob('fake orders', '*/5 * * * * *', () => {
  outerCall<ISpec>('/later/order', {
    productId: 'ncf',
    amount: Math.round(Math.random() * 3),
    userId: 'LiYong',
  });
});
