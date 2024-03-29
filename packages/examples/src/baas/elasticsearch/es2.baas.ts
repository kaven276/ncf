import { Client } from '@elastic/elasticsearch';
import { env } from 'src/env';

const client = new Client({
  node: `http://${env.BAAS_HOST}:9200`,
});

export default client;
