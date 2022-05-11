import { execute } from './executor';
import { getDebug } from './util/debug';
import { Service, IApi } from './lib/faas';

const debug = getDebug(module);
const JWT: string | undefined = process.env.JWT;
let innerCallSeq: number = 0;

/** 各个 faas unit 测试模块使用 */
async function innerCall0(faas: Service<any>, req?: any) {
  innerCallSeq += 1;
  //@ts-ignore
  const faasPath = faas.path!;
  debug('inner call', innerCallSeq, faasPath, req);
  const response = await execute({ faasPath, request: req, }, {
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
  // // const inspected = { testSeq: innerCallSeq, faasPath, request: req, response: response.data };
  // debug('inner call', JSON.stringify(inspected, null, 2));
  // console.dir(inspected, { maxArrayLength: 3, breakLength: 20, depth: 7 });
  return response;
}

/** 各个 faas unit 测试模块使用 */
export async function innerCall<T extends IApi>(faas: Service<T> | T["path"], req?: T["request"]): Promise<T["response"]> {
  const faasPath: string = (typeof faas === 'string') ? faas : faas.faasPath!;
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
  // // const inspected = { testSeq: innerCallSeq, faasPath, request: req, response: response.data };
  // debug('inner call', JSON.stringify(inspected, null, 2));
  // console.dir(inspected, { maxArrayLength: 3, breakLength: 20, depth: 7 });
  return response;
}
