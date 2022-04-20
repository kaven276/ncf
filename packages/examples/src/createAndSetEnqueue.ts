import { createAndSetEnqueue } from '@ncf/scheduler-redis';
import Redis from 'ioredis';
import { env } from 'src/env';

const client = new Redis({
  port: 6379, // Redis port
  host: env.BAAS_HOST, // Redis host
  // username: "default", // needs Redis >= 6
  // password: "my-top-secret",
  db: 0, // Defaults to 0
});

createAndSetEnqueue({
  redisClient: client,
});
