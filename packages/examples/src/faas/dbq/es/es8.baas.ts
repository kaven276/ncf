import { Client } from 'es8';
import { env } from 'src/env';

const client = new Client({
  node: env.ES_URL,
  auth: {
    username: 'elastic',
    password: 'W0tgAkRec=g4FTjj97Na',
  },
});

export default client;
