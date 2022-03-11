import { IncomingMessage } from 'http';
import { asyncLocalStorage } from './lib/transaction';
import { ServiceError } from './lib/ServiceError';
import { watchHotUpdate, registerDep } from './hotUpdate';
import { IFaasModule } from './lib/faas';
import { MWContext } from './lib/middleware';
import Ajv from 'ajv';

watchHotUpdate();

let idSeq = 0;

interface IEntranceProps {
  jwtString: string,
  sub: string,
  faasPath: string,
  request: object,
  stream?: IncomingMessage,
  mock?: boolean,
}

const servicesDir = process.cwd();

function getMiddlewares(): Promise<Function[]> {
  // return Promise.resolve([]); // 暂时关闭中间件来调试
  return new Promise((resolve) => {
    import(`${servicesDir}/src/services/config`).then((m) => resolve(m.middlewares)).catch(() => []);
  });
}

/** 进入服务执行，提供执行环境，事务管理 */
export async function execute({ jwtString, sub, faasPath, request, stream, mock }: IEntranceProps) {

  // step1: 定位服务模块文件路径
  let resolvedPath: string;
  try {
    resolvedPath = require.resolve(`src/services${faasPath}${mock ? '.mock' : ''}`, {
      paths: [servicesDir],
    });
  } catch (e) {
    return {
      status: 404,
    }
  }
  // console.log(`request ${idSeq + 1} ${faasPath} coming...`, resolvedPath);

  // step2: 加载服务模块
  const fassAsync: IFaasModule = await import(resolvedPath).catch(e => {
    // console.log('---- no found ---', e);
    return {};
  });
  const faas = fassAsync.faas;
  if (!faas) {
    return {
      status: 404,
    }
  }
  registerDep(resolvedPath);

  if (fassAsync.requestSchema && !fassAsync.checkRequest) {
    const ajv = new Ajv({ useDefaults: true, coerceTypes: true });
    fassAsync.checkRequest = ajv.compile(fassAsync.requestSchema);
    // console.log('fassAsync.checkRequest', fassAsync.requestSchema, request);
  }

  if (fassAsync.checkRequest) {
    try {
      if (fassAsync.checkRequest(request) === false) {
        return {
          status: 400,
          msg: 'request invalid',
          errors: fassAsync.checkRequest.errors,
        }
      }
    } catch (e) {
      return {
        status: 400,
        msg: e.toString(),
      }
    }
  }

  // 反向登记依赖的 children，child 改变时，可以将依赖服务删除
  console.log(resolvedPath);


  // step 3: 执行服务模块
  return asyncLocalStorage.run({ id: ++idSeq, db: {}, jwtString, jwt: { sub } }, async () => {
    const store = asyncLocalStorage.getStore()!;

    // 最终做成像 koa 式的包洋葱中间件

    const mwContext: MWContext = {
      path: faasPath,
      request: request,
      response: null,
      callState: store,
    }
    const middlewares = await getMiddlewares();

    function runMiddware(n: number) {
      console.log(`----- middleware ${n}`)
      const mw = middlewares[n];
      if (!mw) return;
      return mw(mwContext, () => runMiddware(n + 1));
    }

    let result;
    try {
      await runMiddware(0);
    } catch (e) {
      // 出问题，提前拦截了
      if (e instanceof ServiceError) {
        return { status: 500, code: e.code, msg: e.message };
      } else {
        console.log('--------- not ServiceError', e.code, e.message);
        return { status: 500, code: e.code, msg: e.message };
      }
    }

    try {
      const result = await faas(request, stream);
      if (store.db) {
        // @ts-ignore
        await Promise.all(Object.values(store.db).map(db => db.commitTransaction()));
      }
      // console.log('res.end successfully');

      // 校验响应数据规格
      {
        // console.log({ result })
        if (fassAsync.responseSchema && !fassAsync.checkResponse) {
          const ajv = new Ajv();
          fassAsync.checkResponse = ajv.compile(fassAsync.responseSchema);
        }
        if (fassAsync.checkResponse) {
          try {
            if (fassAsync.checkResponse(result) === false) {
              return {
                status: 500,
                msg: 'response invalid',
                errors: fassAsync.checkResponse.errors,
              }
            }
          } catch (e) {
            return {
              status: 500,
              msg: e.toString(),
            }
          }
        }
      }

      return { code: 0, data: result };
    } catch (e) {
      await Promise.all(Object.values(store.db).map(db => db.rollbackTransaction()));
      // console.log('---------', e instanceof ServiceError, e);
      if (e instanceof ServiceError) {
        return { status: 500, code: e.code, msg: e.message };
      } else {
        // console.log('--------- not ServiceError', e.code, e.message);
        return { status: 500, code: e.code, msg: e.message };
      }
    }
    // console.log(require.cache);
  });



}
