import { watch, type FSWatcher } from 'chokidar';
import { getDebug } from './util/debug';
import type { IFaasModule } from './lib/faas';
import { updateConfig } from './lib/config';
import { awaitModule, tryDestroyModule } from './lifecycle';
import { CodeDir, jsExt, MiddlewareFilePath, prefixLength } from './util/resolve';
import { getMiddlewares } from './lib/middleware';
import { extname, sep } from 'path';
import { addDisposer } from './util/addDisposer';
import { onFaasModuleChange } from './repl';
import * as assert from 'node:assert/strict';

export const executedSet = new WeakSet<IFaasModule>();
const debug = getDebug(module);
let started = false;

let watcher: FSWatcher;
/** 启动服务热更新，只针对服务入口模块，级联模块暂时不支持 */
function watchHotUpdate() {

  started = true;

  watcher = watch(CodeDir, {
    depth: 9,
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true,
    atomic: 200,
  });

  watcher.on("change", (absPath) => {
    // 不管目标 faas 是否执行过，只要改变都意味着触发执行自动测试
    onFaasModuleChange(absPath);
    if (!require.cache[absPath]) {
      return; // 从没有加载过，第一次加载，无需清理老版本，直接返回
    };
    debug('file change/saved', absPath);
    deleteCacheForUpdated(absPath);
  });

  addDisposer(() => watcher.close());
}

declare global {
  // 每个 NodeJs 模块都可以有就绪中和已就绪状态，可以跟踪依赖自己的模块
  interface NodeModule {
    /** 是否已经在后处理了，如果没有 ready，且在后处理中，也需要等待 */
    __initPromise?: Promise<any>,
    /** 是否已经完全后处理完毕处于就绪状态 */
    __ready?: true,
    /** import 本模块的模块的绝对路径集合，用于热更新级联更新依赖自己的模块 */
    __depSet?: Set<string>,
  }
}

async function collectWhoDependMeReal(currentModule: NodeModule): Promise<void> {

  const absFileName = currentModule.filename;

  // 对子模块递归处理
  const promises = currentModule.children.map(async subModule => {
    const subPath = subModule.filename;
    // 可能会出现两个模块互相引用的情况造成死循环
    // debug('collectWhoDependMe', absFileName.substring(ServiceDir.length), subPath.substring(ServiceDir.length));
    if (!subPath.startsWith(CodeDir)) {
      if (subModule.exports.awaitModule === true) {
        // 反向依赖收集完后，进行本模块的 lifecycle 初始化，确保只进行一次
        // debug('await module', subModule.filename);
        await awaitModule(subModule);
      }
      return;
    };
    assert.ok(subModule.loaded); // 此时必定 loaded=true
    if (currentModule.__depSet?.has(subPath)) return; // 防止循环引用造成 stack overflow
    await collectWhoDependMePara(subModule, absFileName);
  });
  await Promise.all(promises);

  // inner 依赖了一个 faas，注入自标注路径，来支持内部调用寻址
  if (currentModule.exports.faas) {
    const endPos = absFileName.length - extname(absFileName).length;
    currentModule.exports.faas.faasPath = absFileName.substring(prefixLength, endPos);
  }
  // debug('awaitModule', currentModule.filename);
  // 反向依赖收集完后，进行本模块的 lifecycle 初始化，确保只进行一次
  await awaitModule(currentModule);

}

/** 模块没处理过，则处理，如果处理中也是要等待；支持对一个模块并发初始化的处理 */
async function collectWhoDependMePara(currentModule: NodeModule, whoImportMeStr?: string): Promise<void> {
  if (whoImportMeStr) {
    let depSet = currentModule.__depSet;
    if (!depSet) {
      // submodule 第一次被依赖
      depSet = currentModule.__depSet = new Set<string>();
    }
    depSet.add(whoImportMeStr); // 添加反向依赖关系
  }

  if (currentModule.__ready) {
    return;
  }
  const first = !currentModule.__initPromise;
  if (first) {
    currentModule.__initPromise = collectWhoDependMeReal(currentModule);
  }
  debug('module loading', first, currentModule.filename.slice(prefixLength), '-by-', whoImportMeStr?.slice(prefixLength));
  await currentModule.__initPromise;
  debug('module loaded', first, currentModule.filename.slice(prefixLength), '-by-', whoImportMeStr?.slice(prefixLength));
}

/** 级联删除依赖自己的模块的缓存，使得再次 import() 他们能加载新版。
 * 其中 updatedFileName 来自自动从 module.children 的收集，路径为系统相关格式。
 */
function deleteCacheForUpdated(updatedFileName: string) {
  debug('delete cache', updatedFileName);

  // 如果是 BAAS 模块更新，老的 BAAS 资源需要先清除掉释放资源
  const m = require.cache[updatedFileName]!;
  if (!m) {
    // debug('already delete cache, just bypass', updatedFileName);
    return;
  }
  const importers = m.__depSet;
  tryDestroyModule(m);

  // 从模块缓存是删除，这样再次加载改模块就能看到更新的版本
  delete require.cache[updatedFileName];

  // 如果是目录模块更新，则要更新内部的配置链中的节点
  if (updatedFileName.endsWith(sep + 'index' + jsExt)) {
    updateConfig(updatedFileName);
  }

  // 不再级联向上找所有受到影响的模块并自动测试，因为已经测试执行过的模块很多的话，可能会导致大量并发请求发出产生高负载
  if (false && executedSet.has(m.exports)) {
    // 所有曾经执行过的依赖本模块的 faas 都将自动重新测试
    // debug('re test', updatedFileName);
    onFaasModuleChange(updatedFileName);
  } else {
    // debug('no retest', updatedFileName);
  }

  if (!importers) {
    if (updatedFileName === MiddlewareFilePath) {
      getMiddlewares(); // 更新中间件
      return;
    }
    if (!updatedFileName.endsWith('./test' + jsExt)) {
      debug('top depender modified', updatedFileName);
      const testPath = updatedFileName.replace(jsExt, '.test' + jsExt);
      import(testPath).catch(e => {
        if (e.code === 'MODULE_NOT_FOUND') {
          return;
        } else {
          console.warn(e);
        }
      });
    }
    return;
  };

  // 向上找 import 本模块的调用者模块，级联完成更新
  for (let importer of importers) {
    if (importer === updatedFileName) {
      process.exit();
    }
    deleteCacheForUpdated(importer);
  }
}
/** 从 faas/config 出发，查看依赖树，登记反向依赖树。
 * 因为中间遇到 baas 需要等待其完成异步初始化，所以是 async 函数
 */
export const registerDep = async (absServicePath: string) => {
  debug('collecting from', absServicePath);
  const m = require.cache[absServicePath]!;
  await collectWhoDependMePara(m);
  // await awaitModule(m);
};

/** 等待全部依赖本模块的其他模块(逐级依赖)都 ready 后，返回 */
export const whenModuleReady = async (m: NodeModule) => {
  debug('collecting from', m.id);
  await collectWhoDependMePara(m);
  // await awaitModule(m);
};

/** 执行后台长任务 */
export async function runTask(m: NodeModule, task: () => Promise<void>) {
  if (watcher) {
    watcher.close();
  }
  await whenModuleReady(m);
  await task();
}


// 部署到服务器上需要设置 NODE_ENV 环境变量来标识部署环境，本地开发环境不配置则默认开启开发热更新
if (process.env.NODE_ENV === undefined) {
  watchHotUpdate();
}
