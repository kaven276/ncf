import { Service } from '@ncf/microkernel';
import redis from '.';

interface Api {
  path: '/redis/order',
  request: {
    /** 大家竞争订单的区域 */
    area?: string,
    /** 用户标识 */
    userid: string,
  },
  response: {
    /** 生成的订单标识 */
    orderId: number,
    /** 在同一个 area，本订单排在第几位 */
    order: number,
  }
}

const OrderKey = 'Order';
let seqOrderId: number = 0;

export const faas: Service<Api> = async (req) => {
  const orderId = ++seqOrderId;
  const key = `${OrderKey}:${req.area ?? 'default'}`;
  const now = Date.now();
  await redis.zadd(key, orderId, now);
  const order = (await redis.zrank(key, now))!;
  // 默认一些订单已经被完成
  setTimeout(() => {
    redis.zrem(key, now);
  }, (Math.random() * 5 + 0) * 1000);
  return { orderId, order }
}
