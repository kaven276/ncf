import { getDebug } from './util/debug';
import { ProjectDir } from './util/resolve';

const prefixLength = ProjectDir.length;
const debug = getDebug(module);

interface ILifecycle<T> {
  default?: T,
  /** 模块加载时执行的代码，返回的结果将被用于替换 exports.default。ncf 确保一个 BAAS 连接池只被创建和初始化一次 */
  initialize: () => Promise<T>,
  /** hotUpdate 时，或者进程退出时，将会被系统自动执行，正常的清理资源 */
  destroy?: (baas: T) => Promise<void>,
}

export interface BassModuleExport<T = any> {
  default: T,
  _lifecycle: ILifecycle<T>,
}

/** 设置模块 lifecycle 钩子，并同步返回默认值，无默认值返回 undefined 等待 initialize 的值覆盖
 * @example
 * let datasource = useLifecycle(module, { initialize(){}, destroy(){} })
 * export default datasource;
  */
export function useLifecycle<T>(bm: NodeModule, lifecycle: ILifecycle<T>): T {
  (bm.exports as unknown as BassModuleExport<T>)._lifecycle = lifecycle;
  return lifecycle.default as T;
}

type BassNodeModule = NodeModule;

/** 记录所有在用的 BAAS 模块，为了在退出进程时执行它们的清理过程 */
const baasSet = new Map<string, BassModuleExport>();

/** 一个 NodeModule 是否是 baas module */
export function isBaasModule(m: NodeModule) {
  return !!m.exports._lifecycle;
}

/** 登记一个 BAAS NodeModule，该退出服务进程时，好做连接池清理等清理善后工作 */
export async function registerDynamicBaas<T>(absPath: string): Promise<BassModuleExport<T>> {
  return (await registerBaas(require.cache[absPath] as BassNodeModule)).exports;
}

/** 登记一个 BAAS NodeModule，该退出服务进程时，好做连接池清理等清理善后工作 */
export async function registerBaas(bm: BassNodeModule) {
  const path = bm.filename.substring(prefixLength);
  baasSet.set(path, bm.exports as BassModuleExport);
  const exp = bm.exports as BassModuleExport;

  try {
    const ds = exp.default = await exp._lifecycle.initialize(); // 注册 baas 后立即就确保连接池创建好

    // 如果 baas 模块没有定义如何 destroy，做一定的智能判断
    if (!exp._lifecycle.destroy) {
      if (ds.destroy && (typeof ds.destroy === 'function')) {
        // https://github.com/typeorm/typeorm
        exp._lifecycle.destroy = async (ds) => {
          await ds.destroy();
        }
      } else if (ds.end && (typeof ds.end === 'function')) {
        // https://node-postgres.com/api/pool#poolend
        exp._lifecycle.destroy = async (ds) => {
          await ds.end();
        }
      } else if (ds.close && (typeof ds.close === 'function')) {
        // https://oracle.github.io/node-oracledb/doc/api.html#poolclose
        exp._lifecycle.destroy = async (ds) => {
          await ds.close();
        }
      }
    }
  } catch (e) {
    debug('register baas failed', path);
    console.error(e);
    // throw e;
  }
  return bm;
}

/** 登记一个 BAAS NodeModule，该退出服务进程时，好做连接池清理等清理善后工作 */
export function destroyOldBaas(bm: BassNodeModule) {
  const path = bm.filename.substring(prefixLength);
  const oldBaas = baasSet.get(path);
  if (!oldBaas) return;
  debug(`try close baas pool/resource for ${bm.filename}`);
  if (oldBaas && oldBaas._lifecycle.destroy) {
    // https://node-postgres.com/api/pool#poolend
    debug(`hot update BAAS for ${path}, destroying the old`);
    oldBaas._lifecycle.destroy(oldBaas.default); // 如果热更新了 baas 模块，则先要清理原来的连接池
  }
  baasSet.delete(path);
}


// see https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
process.on('SIGINT', function () {
  const promises: Promise<void>[] = [];
  baasSet.forEach((bm, path) => {
    if (!bm.default) return; // 还未初始化完成
    if (!bm._lifecycle.destroy) return; // 没有注册消耗处理器
    debug(`destroying baas for ${path}`);
    const promise = bm._lifecycle.destroy(bm.default);
    promise.then(() => {
      debug(`destroyed baas for ${path}`);
    }).catch((e) => {
      console.error(`destroy baas ${path} exception`, e);
    });
    promises.push(promise);
  });
  Promise.all(promises).then(() => {
    debug('all baas module destroyed');
    process.exit(0);
  });
});
