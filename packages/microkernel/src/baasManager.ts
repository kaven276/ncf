import { getDebug } from './util/debug';
import { servicesDir } from './util/resolve';

const prefixLength = servicesDir.length;
const debug = getDebug(module);

interface BassModuleExport<T = any> {
  baas: () => Promise<T>,
  destroy?: () => Promise<void>,
}

type BassNodeModule = NodeModule;

const baasSet = new Map<string, BassModuleExport>();

/** 登记一个 BAAS NodeModule，该退出服务进程时，好做连接池清理等清理善后工作 */
export function registerBaas(bm: BassNodeModule) {
  const path = bm.filename.substring(prefixLength);
  baasSet.set(path, bm.exports as BassModuleExport);
}

/** 登记一个 BAAS NodeModule，该退出服务进程时，好做连接池清理等清理善后工作 */
export function destroyOldBaas(bm: BassNodeModule) {
  const path = bm.filename.substring(prefixLength);
  const oldBaas = baasSet.get(path);
  if (!oldBaas) return;
  debug(`try close baas pool/resource for ${bm.filename}`);
  if (oldBaas && oldBaas.destroy) {
    debug(`hot update BAAS for ${path}, destroying the old`);
    oldBaas.destroy(); // 如果热更新了 baas 模块，则先要清理原来的连接池
  }
  baasSet.delete(path);
}


// see https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
process.on('SIGINT', function () {
  const promises: Promise<void>[] = [];
  baasSet.forEach((bm, path) => {
    if (bm.destroy) {
      debug(`destroying baas for ${path}`);
      const promise = bm.destroy();
      promise.then(() => {
        debug(`destroyed baas for ${path}`);
      }).catch((e) => {
        console.error(`destroy baas ${path} exception`, e);
      });
      promises.push(promise);
    }
  });
  Promise.all(promises).then(() => {
    debug('all baas module destroyed');
  });
});
