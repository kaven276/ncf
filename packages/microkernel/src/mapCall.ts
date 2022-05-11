import { innerCall } from './innerCall';
import { IApi } from './lib/faas';

/** 一次性用多个命名请求参数调用同一个 faas，通常用于 faas 单元测试。key _ 开头表示不对其请求进行调用 */
export async function mapCall<T extends IApi = IApi>(path: T["path"], reqMap: { [key: string]: T["request"] })
  : Promise<{ [key in keyof typeof reqMap]?: T["response"] }> {
  const reqMap2: any = {};
  Object.entries(reqMap).forEach(([k, v]) => {
    if (!k.startsWith('_')) {
      reqMap2[k] = v;
    }
  });
  const results = await Promise.all(Object.keys(reqMap2).map((key) => innerCall<T>(path, reqMap2[key])));
  const obj = {} as any;
  Object.keys(reqMap2).map((key, idx) => obj[key] = {
    path,
    request: reqMap2[key],
    response: results[idx],
  });
  return obj;
}
