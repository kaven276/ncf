import { outerCall, addDisposer } from '@ncf/microkernel';
import { scheduleJob } from 'node-schedule';
import { ISpec } from 'src/faas/later/order.spec';

export const job = scheduleJob('fake orders', '*/5 * * * * *', () => {
  outerCall<ISpec>('/later/order', {
    productId: 'ncf',
    amount: Math.round(Math.random() * 3),
    userId: 'LiYong',
  });
});

// 以后可能提供自动扫描功能，对 export job 的模块自动添加安全 cancel，减少模板代码书写
addDisposer(() => job.cancel());
