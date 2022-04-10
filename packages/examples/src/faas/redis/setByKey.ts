import redis from 'src/baas/ioredis/redisdb1.baas';

interface IRequest {
  key?: string,
  value?: string,
}

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas(req: IRequest) {
  await redis.set(req.key ?? "mykey", req.value ?? "value");
}
