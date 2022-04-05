import { lifecycle } from './makeRedisClient';
import { env } from 'src/env';

let pool = lifecycle(module, {
  port: 6379, // Redis port
  host: env.BAAS_HOST, // Redis host
  username: "default", // needs Redis >= 6
  // password: "my-top-secret",
  db: 0, // Defaults to 0
});

export default pool;
