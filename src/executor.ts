import { asyncLocalStorage } from 'src/lib/transaction';
import { ServiceError } from 'src/lib/ServiceError';
import { watchHotUpdate, registerDep } from './hotUpdate';
import { IFaasModule } from './lib/faas';

watchHotUpdate();

let idSeq = 0;

interface IEntranceProps {
  jwtString: string,
  sub: string,
  faasPath: string,
  request: object,
  mock?: boolean,
}

function getMiddlewares(): Promise<Function[]> {
  return new Promise((resolve) => {
    import(`src/services/config`).then((m) => resolve(m.middlewares)).catch(() => []);
  });
}

/** 进入服务执行，提供执行环境，事务管理 */
export async function execute({ jwtString, sub, faasPath, request, mock }: IEntranceProps) {

  // step1: 定位服务模块文件路径
  let resolvedPath: string;
  try {
    resolvedPath = require.resolve(`src/services${faasPath}${mock ? '.mock' : ''}`);
  } catch (e) {
    return {
      status: 404,
    }
  }
  console.log(`request ${idSeq + 1} ${faasPath} coming...`, resolvedPath);

  // step2: 加载服务模块
  const fassAsync: IFaasModule = await import(resolvedPath).catch(e => {
    console.log('---- no found ---', e);
    return {};
  });
  const faas = fassAsync.faas;
  if (!faas) {
    return {
      status: 404,
    }
  }
  registerDep(resolvedPath);

  if (fassAsync.checkRequest) {
    try {
      fassAsync.checkRequest(request)
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

    const middlewares = await getMiddlewares();
    let result;
    try {
      for (const mw of middlewares) {
        result = await mw(faasPath);
      }
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
      const result = await faas(request);
      if (store.db) {
        // @ts-ignore
        await Promise.all(Object.values(store.db).map(db => db.commitTransaction()));
      }
      console.log('res.end successfully');
      return { code: 0, data: result };
    } catch (e) {
      await Promise.all(Object.values(store.db).map(db => db.rollbackTransaction()));
      console.log('---------', e instanceof ServiceError, e);
      if (e instanceof ServiceError) {
        return { status: 500, code: e.code, msg: e.message };
      } else {
        console.log('--------- not ServiceError', e.code, e.message);
        return { status: 500, code: e.code, msg: e.message };
      }
    }
    // console.log(require.cache);
  });
}
