import Redis from 'ioredis';
import { createScheduler } from '../src';

const redisClient = new Redis({
  port: 6379, // Redis port
  host: '127.0.0.1', // Redis host
  // username: "default", // needs Redis >= 6
  // password: "my-top-secret",
  db: 0, // Defaults to 0
});

createScheduler({
  redisClient,
  faasUrlHttp: 'http:127.0.0.1:8081',
});
