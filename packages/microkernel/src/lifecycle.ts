import { getDebug } from './util/debug';

const debug = getDebug(module);
const symbol = Symbol('resolved');

type Disposer<T = any> = () => Promise<void>;

type AddDisposer<T> = (disposer: Disposer<T>) => void;

type PromiseMaker<T> = (addDisposer: AddDisposer<T>) => Promise<T>;

/** 控制模块生命周期，确保模块先初始化完成后再被使用
 * 效果类似于 esm 的 top await，但是
 * 1) 多了 destroy 定义，再退出进程前，能确保 graceful 结束模块，释放资源
 * 2) 少了在 module 顶层部分引用 top await 结果的支持
 */
export function resolved<T>(promiseMaker: PromiseMaker<T>): T {
  //@ts-expect-error
  return { [symbol]: promiseMaker } as T; // 故意将 promise 返回的类型当做最终类型，欺骗调用方引用的是等待解析完的类型，方便使用
}

/** 判断 exports 项是否是采用 resolved 返回的数据结构 */
const isPromise = <T = any>(val: unknown): val is { [symbol]: PromiseMaker<T> } => {
  return (val !== null) && (typeof val === 'object') && (symbol in val);
}

declare global {
  interface NodeModule {
    /** 记录模块由于热更新或者进程退出时，需要执行的清理过程 */
    _disposers?: {
      [exportsKey: string]: Disposer,
    },
  }
}

interface StatefulNodeModule extends NodeModule {
  _disposers: {
    [exportsKey: string]: Disposer,
  },
}

/** 从 entrance(faas/index) import 完后，直接依赖分析过程中，对所有模块调用 awaitModule */
export async function awaitModule(m: NodeModule): Promise<void> {
  const promises: Promise<any>[] = [];
  const disposers: NodeModule["_disposers"] = {};
  function addDisposerMaker(key: string) {
    return (disposer: Disposer) => {
      disposers![key] = disposer;
    }
  }
  for (const [key, val] of Object.entries(m.exports)) {
    if (isPromise(val)) {
      debug('top await', m.filename, key);
      const promise = val[symbol](addDisposerMaker(key));
      promise.then(v => m.exports[key] = v);
      promise.then(v => debug(`${m.filename} resolved`));
      promises.push(promise);
    }
  }
  if (promises.length > 0 && Object.values(disposers).length > 0) {
    destroyableModuleSet.add(m);
  }
  m._disposers = disposers;
  await Promise.all(promises);
}

export function tryDestroyModule(m: NodeModule) {
  destroyableModuleSet.delete(m);
  if (m?._disposers) {
    for (const [key, disposer] of Object.entries(m._disposers)) {
      debug('destroying', m.filename, key);
      disposer();
    }
  }
}

let destroyableModuleSet = new Set<NodeModule>();

// see https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
process.on('SIGINT', function () {
  for (const m of destroyableModuleSet) {
    tryDestroyModule(m);
  }
  // Promise.all(promises).then(() => {
  //   debug('all baas module destroyed');
  //   process.e.xit(0);
  // });
});
