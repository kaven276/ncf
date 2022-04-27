import client from 'src/baas/elasticsearch/elk.baas';
import { indexName } from './constant';

/** 查询指定索引文档 */
export async function faas() {
  return await client.search({
    index: indexName,
  });
}
