import { Client } from 'es7';
import { env } from 'src/env';

const client = new Client({
  node: env.ES_URL,
});

export default client;
