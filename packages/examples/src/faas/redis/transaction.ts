import redis from '.';
import { Service } from '@ncf/microkernel';
import type { ISpec, IRequest } from './transaction.spec'

const defReq: IRequest = {
  key: 'txid',
  value: Date.now(),
}

/** 测试直接使用 pg 单个连接提供服务 */
export const faas: Service<ISpec> = async (req: IRequest) => {
  req = { ...defReq, ...req };
  req.key = req.key ?? "mykey";
  const result = await redis.multi()
    .incr('counter').get('counter')
    .set(req.key, req.value ?? "value")
    .get(req.key ?? "mykey")
    .exec();
  return {
    counter: Number(result?.[1][1]),
    key: req.key,
    value: result?.[3][1],
  };
}
