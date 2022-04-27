import client from 'src/baas/elasticsearch/elk.baas';
import { indexName } from './constant';

export async function faas() {
  const result = await client.count({
    index: indexName,
  });
  return { count: result.body.count };
}
