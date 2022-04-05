import { IncomingMessage } from 'http';
import { extname } from 'path';
import { AsyncLocalStorage } from 'async_hooks';
import { ICallState } from './lib/callState';
import { ServiceError, throwServiceError } from './lib/ServiceError';
import { IFaasModule } from './lib/faas';
import { getConfigByFaas, proxyTriggerPrefixKey, ensureDirConfig, ensureFaasConfig } from './lib/config';
import { IMiddleWare } from './lib/middleware';
import { ProjectDir } from './util/resolve';
import { getDebug } from './util/debug';
import assert from 'assert/strict';
import { registerDep } from './hotUpdate';
import { normalize } from 'path';

const debug = getDebug(module);

let idSeq = 0;

interface IEntranceProps {
  faasPath: string,
  request: object,
  stream?: IncomingMessage,
  mock?: boolean,
  http: ICallState["http"],
}

const asyncLocalStorage = new AsyncLocalStorage<ICallState>();

export function getCallState(): ICallState {
  return asyncLocalStorage.getStore()!;
}

/** 供 index.ts 中的代理模块获取代理目标的路径，也即去掉 prefix 部分的路径 */
export function getProxiedPath(): string | undefined {
  return getCallState().proxiedPath;
}

/** 进入服务执行，提供执行环境，事务管理。
 * 返回 Promise
 */
export async function execute({ faasPath, request, stream, mock, http }: IEntranceProps): Promise<any> {
  idSeq += 1;
  debug(`request ${idSeq} ${faasPath} coming...`);

  const dirConfig = await ensureDirConfig(faasPath);
  /** 即便是代理，依然尝试加载 faas 模块，因为里面可能有请求响应校验和其他配置，虽然没有 export faas */
  const proxyTriggerPrefix: string | undefined = dirConfig[proxyTriggerPrefixKey];

  if (proxyTriggerPrefix) {
    debug('proxyTriggerPrefix', proxyTriggerPrefix);
  }

  // step1: 定位服务模块文件路径
  // 新的 resolve 方式，自顶而下查看 dir config，如果 proxy:true, ext:xxx 则影响 faas resolve
  // 输出为 faas 地址，到具体文件名和后缀，可能来自 dir config (proxy faasPath) 或 faas module
  const ext = dirConfig.ext || '.ts';
  // debug(ext, faasPath, extname(faasPath));
  const tryPath = normalize(`${ProjectDir}/src/services${faasPath}${mock ? '.mock' : ''}${ext}`);

  debug('tryPath', tryPath);

  // step2: 加载服务模块
  // 即便 dir 配置 proxy，也可能内部存在 faas module 做特殊处理的，或者提供请求响应校验，因此也要尝试解析
  const fassModule: IFaasModule = await import(tryPath).catch(e => {
    if (proxyTriggerPrefix) {
      return { fake: true } as IFaasModule;
    } else {
      debug('---- no found ---', e, tryPath);
      throwServiceError(404, '找不到服务模块', {
        path: faasPath,
      });
    }
  });

  if (proxyTriggerPrefix && !fassModule.faas) {
    const dirPath = `${ProjectDir}/src/services${proxyTriggerPrefix}/index.ts`;
    const dirModule = await import(dirPath);
    fassModule.faas = dirModule.faas;
  }

  const faas = fassModule.faas;
  if (!faas) {
    // console.log('fassModule', fassModule);
    return {
      status: 404,
      code: 404,
      msg: '找不到服务定义',
    }
  }

  // 如果 config 已经创建，则为同步执行；否则第一次加载配置会是异步执行
  if (!getConfigByFaas(fassModule)) {
    ensureFaasConfig(dirConfig, fassModule);
  }

  if (!fassModule.fake) {
    await registerDep(tryPath);
  }


  // 反向登记依赖的 children，child 改变时，可以将依赖服务删除
  // console.log(resolvedPath);

  // 找到该 faas 模块的配置

  // step 3: 执行服务模块
  const als: ICallState = {
    id: idSeq,
    http,
    path: faasPath,
    proxiedPath: proxyTriggerPrefix ? faasPath.substring(proxyTriggerPrefix!.length) : undefined,
    request,
    response: null,
    fassModule,
    trans: [],
  }
  const resp = asyncLocalStorage.run<Promise<any>, ICallState[]>(als, async () => {
    const store = asyncLocalStorage.getStore()!;

    assert.equal(als, store);

    // 最终做成像 koa 式的包洋葱中间件

    const middlewares: IMiddleWare[] = await import(`${ProjectDir}/src/services/index.ts`).then((m) => (m.middlewares)).catch(() => []);

    function runMiddware(n: number): Promise<void> {
      debug(`executing middleware ${n}`);
      const mw: IMiddleWare = middlewares[n];
      if (!mw) {
        debug('after middlewares, executing faas');
        return new Promise((resolve, reject) => faas(request, stream).then((response) => {
          als.response = response;
          resolve();
        }).catch(reject));
      };
      //@ts-ignore
      return mw(als, () => runMiddware(n + 1));
    }

    try {
      await runMiddware(0);
      // 一切执行成功无异常后，自动提交事务
      store.trans.length && debug('trans committing');
      await Promise.all(store.trans.map(tran => tran.commit()));
      store.trans.length && debug('trans committed');

      // 正常返回响应
      return als.response;
    } catch (e: any) {

      // 处理出现异常会，事务自动回滚
      await Promise.all(store.trans.map(tran => tran.rollback()));

      // console.log('---------', e instanceof ServiceError, e);
      if (e instanceof ServiceError) {
        throw e;
      } else if (e.code) {
        console.error(e);
        throwServiceError(e.code, e.message, e.data);
      } else {
        throw e;
      }
    }
    // console.log(require.cache);
  });
  return resp;
}
