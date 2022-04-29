import { makeRedisClient } from '@ncf/ioredis';
import { env } from 'src/env';

let redisClient = makeRedisClient(env.REDIS_URL);

export default redisClient;
