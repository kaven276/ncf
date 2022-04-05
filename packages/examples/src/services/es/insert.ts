import { Client } from 'elasticsearch';
import { env } from 'src/env';

interface IData {
  name: string,
  age: number,
}
const data: IData[] = [{
  name: '李勇',
  age: 100,
}, {
  name: '李宇泽',
  age: 4,
}]

const client = new Client({
  host: `${env.BAAS_HOST}:9200`,
  log: 'error',
});

/** 测试从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  await client.ping({ requestTimeout: 3000 }).catch((err) => {
    console.log('ping elastic server err', err);
  });
  await client.bulk({ body: data }).then(resp => {
    console.log('insert buld resp', resp);
  }).catch(console.error);
  return {
    'test': 'elastic',
  }
}
