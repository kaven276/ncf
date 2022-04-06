import redis from 'src/baas/ioredis/redisdb1.baas';

interface IRequest {
  key: string,
}

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas(req: IRequest) {
  const result = await redis.get(req.key ?? "mykey");
  return result;
}
