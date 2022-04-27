import client from 'src/baas/elasticsearch/elk.baas';
import { indexName } from './constant';

/** 创建 es index */
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
