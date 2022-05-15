import { makeRedisClient } from '@ncf/ioredis';
import { env } from 'src/env';

let redisClient = makeRedisClient(env.REDIS_URL, {
  // This is the default value of `retryStrategy`
  retryStrategy(times) {
    const delay = Math.min(Math.pow(1.5, times) * 50, 10000);
    console.log(`redis connect retry ${times}times, will wait for ${delay}ms`);
    return delay;
  },
});

export default redisClient;
