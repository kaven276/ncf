
interface Request {
  /** 产品标识 */
  productId: string,
}

/** 降低库存 */
export const faas = async (req: Request) => {
  console.log(`库存(${req.productId})减少一个`);
}
