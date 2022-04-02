import redis from 'src/bass/ioredis/redisdb1';

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  await redis.set("mykey", "value");
  const result = await redis.get("mykey");
  return result;
}
