import { IncomingMessage } from 'http';
import { asyncLocalStorage } from './lib/transaction';
import { ServiceError } from './lib/ServiceError';
import { watchHotUpdate, registerDep } from './hotUpdate';
import { IFaasModule } from './lib/faas';
import { MWContext, IMiddleWare } from './lib/middleware';
import { servicesDir } from './util/resolve';
import { getDebug } from './util/debug';
import { validate } from './middlewares/validator';

const debug = getDebug(module);

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

function getMiddlewares(): Promise<IMiddleWare[]> {
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
  const fassModule: IFaasModule = await import(resolvedPath).catch(e => {
    // console.log('---- no found ---', e);
    return {};
  });
  const faas = fassModule.faas;
  if (!faas) {
    return {
      status: 404,
    }
  }
  registerDep(resolvedPath);

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
      fassModule: fassModule,
      callState: store,
    }
    const middlewares = await getMiddlewares();
    middlewares.unshift(validate);

    function runMiddware(n: number): Promise<void> {
      // console.log(`----- middleware ${n}`);
      const mw = middlewares[n];
      if (!mw) {
        return new Promise(resolve => faas(request, stream).then((response) => {
          mwContext.response = response;
          resolve();
        }));
      };
      return mw(mwContext, undefined, () => runMiddware(n + 1));
    }

    try {
      await runMiddware(0);
      const result = mwContext.response;
      // 自动提交和回滚事务
      if (store.db) {
        // @ts-ignore
        await Promise.all(Object.values(store.db).map(db => db.commitTransaction()));
      }

      return { code: 0, data: result };
    } catch (e) {
      await Promise.all(Object.values(store.db).map(db => db.rollbackTransaction()));
      // console.log('---------', e instanceof ServiceError, e);
      if (e instanceof ServiceError) {
        return { status: 500, code: e.code, msg: e.message };
      } else if (e.code) {
        return e;
      } else {
        // console.log('--------- not ServiceError', e.code, e.message);
        return { status: 500, code: e.code, msg: e.message };
      }
    }
    // console.log(require.cache);
  });

}
