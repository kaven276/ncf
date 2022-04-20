import { getDebug } from '@ncf/microkernel';

const debug = getDebug(module);

interface Request {
  /** 产品标识 */
  productId: string,
}

/** 降低库存 */
export const faas = async (req: Request) => {
  debug(`库存(${req.productId})减少一个`);
}
