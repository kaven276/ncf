import { makeRedisClient } from '@ncf/ioredis';
import { env } from 'src/env';

let redisClient = makeRedisClient({
  port: 6379, // Redis port
  host: env.BAAS_HOST, // Redis host
  username: "default", // needs Redis >= 6
  // password: "my-top-secret",
  db: 0, // Defaults to 0
});

export default redisClient;
