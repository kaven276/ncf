// 下单

import { laterCall } from '@ncf/microkernel';
import { faas as minusStore } from './minusStore';
import { faas as notifyMail } from './notifyMail';
import { faas as notifySMS } from './notifySMS';

interface Request {
  userId: string,
  productId: string,
  amount: number,
}

/** 下单订购服务，部分处理直接丢入任务队列，发短信通知尝试同步执行 */
export const faas = async (req: Request) => {
  console.log(`写订单表成功(user:${req.userId}; product:${req.productId}; amount:${req.amount})`);
  //@ts-ignore
  laterCall(minusStore, { productId: req.productId }, 0);
  //@ts-ignore
  laterCall(notifyMail, { userId: req.userId }, 0);
  //@ts-ignore
  laterCall(notifySMS, { userId: req.userId });
}
