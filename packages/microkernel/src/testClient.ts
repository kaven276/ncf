import { ProjectDir } from './util/resolve';
import { execute } from './executor';
import { Service } from './lib/faas';
import { getDebug } from './util/debug';
import { GwHttp } from './lib/gateway';

const prefixLength = `${ProjectDir}/src/faas`.length;
const debug = getDebug(module);
const JWT: string | undefined = process.env.JWT;
let testSeq: number = 0;

/** 各个 faas unit 测试模块使用 */
export async function test(module: NodeModule, req?: any) {
  testSeq += 1;
  const faasPath = module.filename.substring(prefixLength).replace('.test.ts', '');
  debug('testing', testSeq, faasPath, req);
  const response = await execute({
    faasPath,
    request: req,
  }, {
    http: {
      //@ts-ignore
      req: {
        headers: {
          authorization: JWT ? ('Bearer ' + JWT) : undefined,
        },
      }
    }
  } as GwHttp);
  const inspected = { testSeq, faasPath, request: req, response: response.data };
  debug('test result', JSON.stringify(inspected, null, 2));
  // console.dir(inspected, { maxArrayLength: 3, breakLength: 20, depth: 7 });
  return response;
}
