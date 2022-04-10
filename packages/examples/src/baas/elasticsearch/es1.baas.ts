import { Client } from 'elasticsearch';
import { env } from 'src/env';

const client = new Client({
  host: `${env.BAAS_HOST}:9200`,
});

export default client;
