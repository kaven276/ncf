import { execute } from './executor';
import { getDebug } from './util/debug';
import { IApi } from './lib/faas';

const debug = getDebug(module);
const JWT: string | undefined = process.env.JWT;
let innerCallSeq: number = 0;

/** 各个 faas unit 测试模块使用 */
export async function innerCall<T extends IApi = IApi>(path: T["path"], req?: T["request"]): Promise<T["response"]> {
  const faasPath: string = path;
  innerCallSeq += 1;
  debug('inner call', innerCallSeq, faasPath, req);
  const response = await execute({ faasPath, request: req || {} }, {
    gwtype: 'http',
    http: {
      //@ts-ignore
      req: {
        headers: {
          authorization: JWT ? ('Bearer ' + JWT) : undefined,
        },
      }
    }
  });
  return response;
}
