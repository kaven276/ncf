import { laterCall, type Service } from '@ncf/microkernel';
import type { ISpec, Request } from './order.spec';
import { faas as minusStore } from './minusStore';
import { faas as notifyMail } from './notifyMail';
import { faas as notifySMS } from './notifySMS';
import { faas as checkIfOrderPayed } from './checkIfOrderPayed';
import { getDebug } from '@ncf/microkernel';

const debug = getDebug(module);

minusStore.faasPath!
let orderId = 0;
/** 下单订购服务，部分处理直接丢入任务队列，发短信通知尝试同步执行 */
export const faas: Service<ISpec> = async (req: Request) => {
  orderId += 1;
  debug(`写订单表成功(orderId:${orderId} user:${req.userId}; product:${req.productId}; amount:${req.amount})`);
  // 走任务队列在执行减少库存操作，但是如果在当前 faas 正常执行后尝试直接执行，如成功就不走队列避免对队列系统造成压力
  laterCall(minusStore, { productId: req.productId });
  // 将发送邮件的任务放到队列中由调度发起执行，第三参数0代表调度无需延迟直接执行
  laterCall(notifyMail, { userId: req.userId }, 0);
  // 将发送短信的任务放到队列中由调度发起执行，第三参数毫秒数代表调度需延迟后再执行
  laterCall(notifySMS, { userId: req.userId }, 5000);
  // 检查订单是否支付了，没有支付则取消订单，支付了则通知配送
  laterCall(checkIfOrderPayed, { orderId: String(orderId) }, 8000);
}
