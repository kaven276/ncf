
interface Request {
  /** 用户标识 */
  userId: string,
}

/** 根据用户标识找到其短信发送订单成功通知 */
export const faas = async (req: Request) => {
  console.log(`发送订单成功短信到 ${req.userId}`);
}
