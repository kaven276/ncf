import client from 'src/baas/elasticsearch/elk.baas';
import { indexName } from './constant';

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

/** 批量项指定的 index 上插入数据 */
export async function faas() {
  try {
    return await client.bulk({
      refresh: 'true',
      body: data.flatMap(doc => [{ index: { _index: indexName } }, doc])
    });
  } catch (e) {
    return e;
  }
}
