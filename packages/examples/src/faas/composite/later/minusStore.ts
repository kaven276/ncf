import { getDebug, Service } from '@ncf/microkernel';

const debug = getDebug(module);

interface Request {
  /** 产品标识 */
  productId: string,
}

interface Api {
  path: '/composite/later/minusStore',
  request: Request,
  response: void,
}

/** 降低库存 */
export const faas: Service<Api> = async (req: Request) => {
  debug(`库存(${req.productId})减少一个`);
}
