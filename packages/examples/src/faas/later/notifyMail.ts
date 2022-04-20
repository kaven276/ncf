import { getDebug } from '@ncf/microkernel';

const debug = getDebug(module);

interface Request {
  /** 用户标识 */
  userId: string,
}

/** 根据用户标识找到其邮箱发送订单成功通知 */
export const faas = async (req: Request) => {
  debug(`发送订单邮件到 ${req.userId}`);
}
