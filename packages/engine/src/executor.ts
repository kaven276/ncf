import { IncomingMessage } from 'http';
import { asyncLocalStorage, ICallState } from './lib/transaction';
import { ServiceError, throwServiceError } from './lib/ServiceError';
import { watchHotUpdate, registerDep } from './hotUpdate';
import { IFaasModule } from './lib/faas';
import { MWContext, IMiddleWare } from './lib/middleware';
import { servicesDir } from './util/resolve';
import { getDebug } from './util/debug';
import { validate } from './middlewares/validator';
import assert from 'assert/strict';

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

interface ISuccessResponse {
  status: number,
  /** 服务处理成功为0 */
  code: 0,
  /** 服务处理的响应数据 */
  data?: any,
}

interface IFailureResponse {
  status: number,
  /** 服务处理失败，值不为 0 */
  code: number,
  /** 伴随异常需要返回给人看的异常信息文字 */
  msg: string,
  /** 其他伴随信息，调用方可能用到 */
  data?: any,
}

/** 提供给各种接入 gateway 使用的响应。核心永远不会 throw 异常，必须返回这个规格的数据 */
type IFinalResponse = ISuccessResponse | IFailureResponse;

function getMiddlewares(): Promise<IMiddleWare[]> {
  return new Promise((resolve) => {
    import(`${servicesDir}/src/services/config`).then((m) => resolve(m.middlewares)).catch(() => []);
  });
}

/** 进入服务执行，提供执行环境，事务管理。
 * 返回 Promise
 */
export async function execute({ jwtString, sub, faasPath, request, stream, mock }: IEntranceProps): Promise<IFinalResponse> {

  // step1: 定位服务模块文件路径
  let resolvedPath: string;
  try {
    resolvedPath = require.resolve(`src/services${faasPath}${mock ? '.mock' : ''}`, {
      paths: [servicesDir],
    });
  } catch (e) {
    return {
      status: 404,
      code: 404,
      msg: '找不到 mock 定义',
    }
  }
  // console.log(`request ${idSeq + 1} ${faasPath} coming...`, resolvedPath);

  // step2: 加载服务模块
  const fassModule: IFaasModule = await import(resolvedPath).catch(e => {
    // console.log('---- no found ---', e, resolvedPath);
    throwServiceError(404, '找不到服务模块', {
      path: faasPath,
    })
  });
  const faas = fassModule.faas;
  if (!faas) {
    // console.log('fassModule', fassModule);
    return {
      status: 404,
      code: 404,
      msg: '找不到服务定义',
    }
  }
  registerDep(resolvedPath);

  // 反向登记依赖的 children，child 改变时，可以将依赖服务删除
  // console.log(resolvedPath);


  // step 3: 执行服务模块
  const callTheadStore: ICallState = {
    id: ++idSeq, trans: [], db: {}, jwtString, jwt: { sub },
  }
  return asyncLocalStorage.run(callTheadStore, async () => {
    const store = asyncLocalStorage.getStore()!;

    assert.equal(callTheadStore, store);

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
        return new Promise((resolve, reject) => faas(request, stream).then((response) => {
          mwContext.response = response;
          resolve();
        }).catch(reject));
      };
      return mw(mwContext, undefined, () => runMiddware(n + 1));
    }

    try {
      await runMiddware(0);
      // 一切执行成功无异常后，自动提交事务
      debug('trans committing');
      await Promise.all(store.trans.map(tran => tran.commit()));
      debug('trans committed');

      // 正常返回响应
      return { code: 0, data: mwContext.response };
    } catch (e) {

      // 处理出现异常会，事务自动回滚
      await Promise.all(store.trans.map(tran => tran.rollback()));

      // console.log('---------', e instanceof ServiceError, e);
      if (e instanceof ServiceError) {
        const status = (e.code >= 100 && e.code <= 999) ? e.code : 500;
        return { status, code: e.code, msg: e.message, data: e.data };
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
