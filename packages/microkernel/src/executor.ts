import { IncomingMessage } from 'node:http';
import { dirname } from 'node:path';
import { type ICallState, getCallState, asyncLocalStorage } from './lib/callState';
import { ServiceError, throwServiceError } from './lib/ServiceError';
import { IFaasModule } from './lib/faas';
import { proxyTriggerPrefixKey, getDirConfigPara } from './lib/config';
import { runMiddwares } from './lib/middleware';
import { ProjectDir, jsExt, MoundDir } from './util/resolve';
import { getDebug } from './util/debug';
import assert from 'assert/strict';
import { registerDep, executedSet } from './hotUpdate';
import { normalize } from 'path';
import { GwExtras } from './lib/gateway';
import { processLaterFaasCalls } from './laterCall';
import { getFaasTsSpec } from './lib/getFaasTsSpec';
import { notifyWaiter } from './flow';
import { Caller } from './lib/caller';
import { doRewrite } from './lib/rewrite';
import { extname } from 'node:path';

const debug = getDebug(module);

let idSeq = 0;

interface IEntranceProps {
  faasPath: string,
  request: object,
  stream?: IncomingMessage,
  mock?: boolean,
}

/** 供 index.ts 中的代理模块获取代理目标的路径，也即去掉 prefix 部分的路径 */
export function getProxiedPath(): string | undefined {
  return getCallState().proxiedPath;
}


/** 进入服务执行，提供执行环境，事务管理。
 * 返回 Promise
 */
export async function execute(income: IEntranceProps, gwExtras: GwExtras, caller?: Caller): Promise<any> {
  const { faasPath: faasPathOri, request, stream, mock } = income;
  let faasPath = await doRewrite(faasPathOri);
  idSeq += 1;
  debug(`request ${idSeq} ${faasPath} coming...`);

  try {
    if ('$tspec' in request) {
      return getFaasTsSpec(faasPath, gwExtras);
    }
  } catch (e) {
  }

  const dirConfig = await getDirConfigPara(dirname(faasPath));
  /** 即便是代理，依然尝试加载 faas 模块，因为里面可能有请求响应校验和其他配置，虽然没有 export faas */
  const proxyTriggerPrefix: string | undefined = dirConfig[proxyTriggerPrefixKey];

  if (proxyTriggerPrefix) {
    debug('proxyTriggerPrefix', proxyTriggerPrefix);
  }

  // step1: 定位服务模块文件路径
  // 新的 resolve 方式，自顶而下查看 dir config，如果 proxy:true, ext:xxx 则影响 faas resolve
  // 输出为 faas 地址，到具体文件名和后缀，可能来自 dir config (proxy faasPath) 或 faas module
  const ext = (() => {
    const inExt = extname(faasPathOri);
    // 如果访问地址是 .html 后缀，则直接映射到 .jsx/.tsx 文件名
    if (inExt === '.html') {
      faasPath = faasPath.slice(0, -5);
      return jsExt + 'x';
    } else {
      return dirConfig.ext || jsExt
    }
  })();
  // debug(ext, faasPath, extname(faasPath));
  const tryPath = normalize(`${ProjectDir}/${MoundDir}/faas${faasPath}${mock ? '.mock' : ''}${ext}`);

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
    const dirPath = `${ProjectDir}/${MoundDir}/faas${proxyTriggerPrefix}/index${jsExt}`;
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
  if (!fassModule.__ready) {
    if (!fassModule.__initPromise) {
      if (fassModule.config) {
        fassModule.__config = Object.assign(Object.create(dirConfig), fassModule.config);
      } else {
        fassModule.__config = dirConfig;
      }
      if (!fassModule.fake) {
        fassModule.__initPromise = fassModule.fake ? Promise.resolve() : registerDep(tryPath);
      }
    }
    if (fassModule.__initPromise) {
      await fassModule.__initPromise;
    }
    fassModule.__ready = true;
  }

  // 反向登记依赖的 children，child 改变时，可以将依赖服务删除
  // console.log(resolvedPath);

  // 找到该 faas 模块的配置

  // step 3: 执行服务模块
  const als: ICallState = {
    id: idSeq,
    path: faasPath,
    proxiedPath: proxyTriggerPrefix ? faasPath.substring(proxyTriggerPrefix!.length) : undefined,
    request,
    response: null,
    stream,
    caller: caller || {} as Caller,
    fassModule,
    trans: [],
    laterFaasCalls: [],
    gw: gwExtras,
  };
  const resp = asyncLocalStorage.run<Promise<any>, ICallState[]>(als, async () => {
    const store = asyncLocalStorage.getStore()!;

    assert.equal(als, store);

    try {
      await runMiddwares(als, async () => {
        debug('after middlewares, executing faas');
        executedSet.add(fassModule);
        return faas(request, stream).then((response) => {
          als.response = response;
        });
      });

      // 处理 later faas calls，前提是主体事务成功了，放到主体事务提交前完成，确保如果写任务队列失败了，主体事务可以得到回滚
      await processLaterFaasCalls(store);

      // 一切执行成功无异常后，自动提交事务
      store.trans.length && debug('trans committing');
      await Promise.all(store.trans.map(tran => tran.commit()));
      store.trans.length && debug('trans committed');

      // 正常执行完 faas，可以通知 flow step waiter
      notifyWaiter(als);

      // 正常返回响应
      return als.response;
    } catch (e: any) {

      if (e instanceof Error) {
        console.error(e.stack);
      }

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


