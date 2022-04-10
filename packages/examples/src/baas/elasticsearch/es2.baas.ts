import { Client } from '@elastic/elasticsearch';
import { env } from 'src/env';

const client = new Client({
  node: `${env.BAAS_HOST}:9200`,
});

export default client;
