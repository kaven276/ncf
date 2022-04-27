import client from 'src/baas/elasticsearch/elk.baas';
import { indexName } from './constant';

/** 测试从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  await client.ping({}).catch((err) => {
    console.log('ping elastic server err', err);
  });
  return await client.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          name: { type: 'text' },
          age: { type: 'integer' },
        }
      }
    }
  }, { ignore: [400] });
}
