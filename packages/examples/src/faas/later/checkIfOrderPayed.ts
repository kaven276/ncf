import { getDebug } from '@ncf/microkernel';

const debug = getDebug(module);

interface Request {
  /** 订单标识 */
  orderId: string,
}

/** 检查订单是否支付了，没有支付则取消订单，支付了则通知配送 */
export const faas = async (req: Request) => {
  debug(`订单(${req.orderId})检查是否已经支付`);
}
