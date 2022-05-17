import { useState, useEffect, useRef } from 'react';
import { IStateTreeNode, SnapshotIn, destroy, unprotect, getSnapshot, IAnyModelType, IAnyStateTreeNode, getType, addMiddleware, IDisposer, IAnyType } from 'mobx-state-tree';
import { mstToReduxDevTools, disconnectMobxStateTreeFromReduxDevTools } from './connectMobxStateTreeToReduxDevTools';
import { cancelMstFlow } from './cancelMstFlowMiddleware';
import { mstException } from 'clib/exCatch';
import Debug from 'debug';

const debug = Debug(module.id);
/** 网络请求预期最快时间，系统能确保在这个时间内完成带销毁模型的销毁，取消在途 flow yield 返回的继续处理 */
const MinimumApiCallTime = 5; // umit ms 毫秒

/** 设置 reaction 时，delay 设置本值，能确保延迟 reaction 执行时，模型实例延迟销毁已经完成取消模型 action 调用效果 */
export const ReactionDelay = MinimumApiCallTime + 3;

const memoMap = new Map<string, string>();

interface IMstBindOptions {
  /** 是否自动连接 redux devtool，组件销毁时自动断开 */
  useReduxDevTool?: boolean,
  /** 是否去掉保护，允许直接修改模型实例 */
  unprotect?: boolean,
  /** 是否在 console 中暴露，使用 window.cm 访问模型实例 */
  debugInConsole?: boolean,
  /** 路由退出重进时，用于恢复模型状态的存储 key，在 map 内存存储
   * @deprecated 需要离开路由在进入保持状态的话，请使用 keepalive
   */
  restoreCacheKey?: string,
  /** 是否永远缓存，可类比 vue 中的 <keep-alive> 路由保持。
   * true 使用当前路由作为缓存 key，string 则直接配置缓存 key。
   * 请确保不同模块的缓存 key 不同，上次模型保存时的key和下次取回缓存模型实例用的key一致。
   * 模型实例一旦创建，页面生命期间始终保持最终的一份实例，进出所属路由不影响在途的 AsyncTrack/flow。
   */
  keepalive?: boolean | string,
  /** 依赖的模型定义，用于比较是否因热更新改变，从而重建模型实例 */
  depModel?: IAnyModelType,
  /** 热更新中重新按新版本模型定义创建的实例是否恢复之前的状态 */
  restoreLastSnapshot?: boolean,
}

/** 随 react 组件创建的模型实例的常用额外选项 */
const defaultOptions: IMstBindOptions = {
  useReduxDevTool: !!window.__REDUX_DEVTOOLS_EXTENSION__,
  unprotect: false,
  debugInConsole: false,
  restoreLastSnapshot: true,
  keepalive: false,
};

/** 支持代码显式删除 mst 缓存，防止占用太多的内存 */
export function deleteCache(key: string) {
  memoMap.delete(key);
}

/** 支持代码显式删除全部 mst 缓存，对于重新登录场景特别适用。 */
export function clearCache() {
  memoMap.clear();
}

interface IDestroyable {
  destroy: () => void;
}
/**
 * 创建一个 mobx 类的实例，并且在组件销毁时执行器 destroy 方法来释放资源
 * @param fn 返回 mobx class 的实例，带 destroy 方法
 * @returns
 */
export function useMobxClassInstance<T extends IDestroyable>(fn: () => T) {
  const [inst] = useState(fn);
  useEffect(() => () => {
    // 模型实例不用后，延迟清理，否则 pending 的异步处理改变被移除的模型实例会报错
    setTimeout(() => {
      inst.destroy && inst.destroy();
    }, 30 * 1000);
  }, []);
  return inst;
}

const KeepAliveCacheMap = new Map<string, IStateTreeNode>();

/** 删除不再需要保留缓存的MST模型实例，帮助再进入对应组件时，重新创建新的初始的实例 */
export function destroyCachedMstInstance(keepAliveKey: string) {
  const model = KeepAliveCacheMap.get(keepAliveKey);
  if (model) {
    // 模型实例不用后，延迟清理，否则 pending 的异步处理改变被移除的模型实例会报错
    cancelMstFlow(model);
    destroy(model);
  } else {
    console.warn(`keepAliveKey ${keepAliveKey} to be destroyed hasn't cached item yet!`);
  }
}

/**
 * 封装创建 MST 模型，自动随组件销毁而执行 destroy 模型，完成清理。如清理外部监听。
 */
export function useCreateMstInstance<T extends IStateTreeNode>(
  /** 返回创建模型实例的函数 */
  fn: (snapshot?: SnapshotIn<IStateTreeNode>, hotReloaded?: boolean) => T,
  opts: IMstBindOptions = defaultOptions
): T {
  // console.count('useCreateMstInstance enter');
  opts = ({ ...defaultOptions, ...opts });
  const ErrorMiddleWareMap = new Map<IStateTreeNode<IAnyType>, IDisposer>();
  const keepAliveKey = opts.keepalive === true ? window.location.href : (opts.keepalive || '');
  const createModel = (snapshot?: object) => {
    if (keepAliveKey) {
      const tryCacheHit = KeepAliveCacheMap.get(keepAliveKey);
      if (tryCacheHit) {
        debug('KeepAliveCacheMap hit', keepAliveKey, tryCacheHit);
        return tryCacheHit;
      }
    }
    let model: T;
    if (snapshot) {
      // 热更新恢复
      model = fn(snapshot);
    } else if (opts.restoreCacheKey) {
      const restoreSnapshot: any = memoMap.get(opts.restoreCacheKey);
      if (restoreSnapshot) {
        if (restoreSnapshot.$restoring !== undefined) {
          model = fn({ ...restoreSnapshot, $restoring: true })
        } else {
          model = fn(restoreSnapshot);
        }
      } else {
        model = fn();
      }
    } else {
      model = fn();
    }
    if (opts.unprotect) {
      unprotect(model);
    }
    // save to cache
    if (keepAliveKey) {
      debug('KeepAliveCacheMap create new', keepAliveKey, model);
      KeepAliveCacheMap.set(keepAliveKey, model);
    }

    if (!ErrorMiddleWareMap.has(model)) {
      ErrorMiddleWareMap.set(model, addMiddleware(model, mstException))
    }
    
    return model;
  }
  const destroyModel = (model: IAnyStateTreeNode) => {
    if (keepAliveKey && KeepAliveCacheMap.has(keepAliveKey)) return;
    // 模型实例不用后，延迟清理，否则 pending 的异步处理改变被移除的模型实例会报错
    if (ErrorMiddleWareMap.has(model)) {
      ErrorMiddleWareMap.get(model)!();
      ErrorMiddleWareMap.delete(model);
    }
    cancelMstFlow(model);
    destroy(model);
  }
  const [model] = useState(createModel);
  const instRef = useRef<IAnyStateTreeNode>(model);
  let latestModel = instRef.current;
  const depModelRef = useRef<IAnyModelType | undefined>(opts.depModel);
  const hotReloadVersionChanged = depModelRef.current !== opts.depModel;
  if (hotReloadVersionChanged) {
    depModelRef.current = opts.depModel;
    // console.count('module recreation');
    debug('hot reloaded', getType(latestModel), window.location.pathname);
    if (keepAliveKey) {
      // 如果使用了 keepalive，那么由于模型定义热更新了，应该删除缓存，再进入重新创建模型实例，可用自动保存的快照来帮助恢复之前的状态
      KeepAliveCacheMap.delete(keepAliveKey);
    }
    destroyModel(latestModel);
    // 如新版本 MST 加载，则重建创建 MST 实例并用快照恢复热更新前的状态
    if (opts.restoreLastSnapshot) {
      const snapshot: any = getSnapshot(latestModel);
      if (snapshot.$hotReloading !== undefined) {
        latestModel = createModel({ ...snapshot, $hotReloading: true });
      } else {
        latestModel = createModel(snapshot);
      }
    } else {
      latestModel = createModel();
    }

  }

  // 引用新创建 MST 模型实例的组件退出时，销毁模型实例，并且退出到 redux tools 的连接
  // 触发条件 1：组件卸载。应只执行模型实例卸载代码
  // 触发条件 2：组件(非当前产生的模型实例的模型) hot-reload。应什么都不做，
  // 触发条件 3: 模型 hot-reload。应先保存快照，然后执行模型实例卸载代码，然后再进入新创建模型实例并应用快照(opt可控)

  // 处理 dev-tool 集成
  const lastUseReduxDevTool = useRef<boolean>(false);
  useEffect(() => {
    if (lastUseReduxDevTool.current !== opts.useReduxDevTool) {
      // 配置改变的情况
      if (!lastUseReduxDevTool.current && opts.useReduxDevTool) {
        // 初始要，或者从不要到要
        mstToReduxDevTools(latestModel);
      } else if (lastUseReduxDevTool.current && !opts.useReduxDevTool) {
        // 从要到不要
        disconnectMobxStateTreeFromReduxDevTools(latestModel);
      }
      lastUseReduxDevTool.current = opts.useReduxDevTool!;
    } else {
      // 配置没变的情况
      if (opts.useReduxDevTool && hotReloadVersionChanged) {
        // 模型重建了，需要断开换来的链接，连接新的模型实例到 dev-tool，不管是不是 keepalive 的
        disconnectMobxStateTreeFromReduxDevTools(latestModel);
        // 警告！这里需要延迟，等待上面的 disconnect 完成后再用新模型实例连 devtool，否则可能刚连上就被清理了
        setTimeout(() => mstToReduxDevTools(latestModel), 200);
      }
    }
  }, [opts.useReduxDevTool]);

  // 真正的 finally destroy 才执行，热更新情形不执行
  const timerRef = useRef<NodeJS.Timeout | undefined>();
  useEffect(() => {
    debug('mst destroy useEffect enter');
    if (timerRef.current) {
      // 又重新进入了，说明是热更新导致，就取消清理
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    return () => {
      timerRef.current = setTimeout(() => {
        // 全部最终销毁的代码，keepAliveKey 时不销毁，否则在进入又会用同一个MST实例又重新创建新的 devtools 条目，从而造成重复项
        if (opts.useReduxDevTool && !keepAliveKey) {
          disconnectMobxStateTreeFromReduxDevTools(latestModel);
        }
        if (opts.restoreCacheKey) {
          const snapshot = getSnapshot(model);
          if (snapshot.$hotReloading !== undefined) {
            memoMap.set(opts.restoreCacheKey, { ...snapshot, $hotReloading: false });
          } else {
            memoMap.set(opts.restoreCacheKey, snapshot);
          }
        }
        destroyModel(latestModel);
      }, MinimumApiCallTime);
      debug('mst destroy useEffect leave');
    }
  }, [])

  // 处理是否在 console 中访问 model 实例用于调试
  useEffect(() => {
    window.cm = opts.debugInConsole ? model : undefined;
    return () => {
      window.cm = undefined;
    }
  }, [opts.debugInConsole]);

  instRef.current = latestModel;
  
  return latestModel;
}
