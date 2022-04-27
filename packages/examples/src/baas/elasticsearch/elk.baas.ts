import { Client } from 'es7';

const IP = '192.168.120.252';

const client = new Client({
  node: `http://${IP}:9200`,
});

export default client;
