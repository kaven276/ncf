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
  baasSet.set(bm.filename.substring(prefixLength), bm.exports as BassModuleExport);
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
