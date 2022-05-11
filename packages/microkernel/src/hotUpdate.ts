import { watch } from 'chokidar';
import { getDebug } from './util/debug';
import { updateConfig } from './lib/config';
import { awaitModule, tryDestroyModule } from './lifecycle';
import { ProjectDir, jsExt, MoundDir } from './util/resolve';
import { extname, sep } from 'path';
import { onFaasModuleChange } from './repl';
const ServiceDir = `${ProjectDir}/${MoundDir}/faas`;

/** 跟踪一个模块是否被初始化过 */
const loadedSet = new WeakSet<NodeModule>();

const prefixLength = ServiceDir.length;
const debug = getDebug(module);
let started = false;

/** 启动服务热更新，只针对服务入口模块，级联模块暂时不支持 */
export function watchHotUpdate() {

  started = true;

  const watcher = watch(ProjectDir, {
    depth: 9,
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true,
    atomic: 200,
  });

  watcher.on("change", (absPath) => {
    onFaasModuleChange(absPath);
    if (!require.cache[absPath]) return;
    debug('file change', absPath);
    deleteCacheForUpdated(absPath);
  });

  process.once('SIGINT', () => {
    watcher.close();
  });
}

/** 都是按照解析完的 module.filename 来记录关系的 */
const depsMap = new Map<string, Set<string>>();

async function collectWhoDependMe(parentModule: NodeModule, whoImportMeStr?: string) {

  const absFileName = parentModule.filename;

  if (whoImportMeStr) {
    let depSet = depsMap.get(absFileName);
    if (!depSet) {
      // submodule 第一次被依赖
      depSet = new Set<string>();
      depsMap.set(absFileName, depSet);
    }
    depSet.add(whoImportMeStr); // 添加反向依赖关系
  }

  // 防止被重复依赖而导致重复初始化和重复反向依赖收集
  if (loadedSet.has(parentModule)) return;
  loadedSet.add(parentModule);

  // 对子模块递归处理
  const promises = parentModule.children.map(async subModule => {
    const subPath = subModule.filename;
    // 可能会出现两个模块互相引用的情况造成死循环
    // debug('collectWhoDependMe', absFileName.substring(ServiceDir.length), subPath.substring(ServiceDir.length));
    if (!subPath.startsWith(ProjectDir)) return;
    if (subModule.loaded === false) return; // 此时必定 loaded=true
    if (depsMap.get(parentModule.filename)?.has(subPath)) return; // 防止循环引用造成 stack overflow
    await collectWhoDependMe(subModule, absFileName);
  });
  await Promise.all(promises);

  // inner 依赖了一个 faas，注入自标注路径，来支持内部调用寻址
  if (parentModule.exports.faas) {
    const endPos = absFileName.length - extname(absFileName).length
    parentModule.exports.faas.faasPath = absFileName.substring(prefixLength, endPos);
  }
  // 反向依赖收集完后，进行本模块的 lifecycle 初始化，确保只进行一次
  await awaitModule(parentModule);

  // if (absFileName.endsWith('/test1' + jsExt)) {
  //   debug('track', subPath, [...depsMap.get(subPath)!]);
  // }
}

/** 级联删除依赖自己的模块的缓存，使得再次 import() 他们能加载新版。
 * 其中 updatedFileName 来自自动从 module.children 的收集，路径为系统相关格式。
 */
function deleteCacheForUpdated(updatedFileName: string) {
  debug('delete cache', updatedFileName);

  // 如果是 BAAS 模块更新，老的 BAAS 资源需要先清除掉释放资源
  const m = require.cache[updatedFileName]!;
  tryDestroyModule(m);

  // 从模块缓存是删除，这样再次加载改模块就能看到更新的版本
  delete require.cache[updatedFileName];

  // 如果是目录模块更新，则要更新内部的配置链中的节点
  if (updatedFileName.endsWith(sep + 'index' + jsExt)) {
    updateConfig(updatedFileName);
  }

  // 回溯再无引用者，则退出
  const importers = depsMap.get(updatedFileName);
  // if (updatedFileName.endsWith('/test1' + jsExt)) {
  //   debug('on delete importers', updatedFileName, importers);
  // }

  depsMap.delete(updatedFileName); // 依赖自己的部分全完成

  if (!importers) {
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
  await collectWhoDependMe(m);
  await awaitModule(m);
}


// 只有开发环境才会启用自动热更新，生产环境可以节省资源
if (process.env.NODE_ENV === 'development' || jsExt === '.ts') {
  watchHotUpdate();
}
