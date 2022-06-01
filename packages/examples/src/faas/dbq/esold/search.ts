import client from 'src/baas/elasticsearch/elk.baas';
import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch'
import { indexName } from './constant';

async function search() {
  const result = await client.search({
    index: indexName,
    from: 30,
    size: 1,
    stored_fields: ["_source"],
    // _source: ["name", "age"],
    human: false,
    filter_path: [""],
    type: "_doc",
    explain: false,
    sort: "age",
  });
  return result.body.hits.hits;
}

async function reindex() {
  const result = await client.reindex({
    source: indexName,
    body: {},
  });
  return result;
}



/** 查询指定索引文档 */
export async function faas() {
  try {
    return await search();
  } catch (e) {
    return e;
  }
}
