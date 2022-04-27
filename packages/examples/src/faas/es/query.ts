import client from 'src/baas/elasticsearch/elk.baas';
import { indexName } from './constant';

/** 测试从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  return await client.search({
    index: indexName,
  });
}
