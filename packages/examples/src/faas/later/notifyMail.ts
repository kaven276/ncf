
interface Request {
  /** 用户标识 */
  userId: string,
}

/** 根据用户标识找到其邮箱发送订单成功通知 */
export const faas = async (req: Request) => {
  console.log(`发送订单邮件到 ${req.userId}`);
}
