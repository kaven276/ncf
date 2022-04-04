import { watch } from 'chokidar';
import { getDebug } from './util/debug';
import { root } from './lib/config';
import { registerBaas, destroyOldBaas, isBaasModule } from './baasManager';
import { servicesDir } from './util/resolve';
import { extname } from 'path';
const ServiceDir = servicesDir + '/src/services';

const prefixLenght = ServiceDir.length;
const debug = getDebug(module);
let started = false;

function updateConfig(absPath: string) {
  // 目录配置改变的话，更新 config prototype chain
  debug('config changed for', absPath.substring(prefixLenght));
  const dirs = absPath.substring(prefixLenght + 1).split('/');
  dirs.pop();
  debug('config dirs', dirs);
  let cfgNode = root;
  for (let dir of dirs) {
    cfgNode = cfgNode.subs[dir];
    if (!cfgNode) return; // 还没有被使用过，等待 faas 模块加载时再加载
  }
  // 先删除之前 prototype chain node 上的配置；因为只有开发时热更新用，无需考虑处理性能
  Object.getOwnPropertySymbols(cfgNode.cfg).forEach(symbolKey => {
    delete cfgNode.cfg[symbolKey];
  })
  // 随后动态加载配置更新
  import(absPath).then(dirModule => {
    if (dirModule.config) {
      // debug('update config by', dirModule.config, root);
      Object.assign(cfgNode.cfg, dirModule.config);
      // debug(cfgNode.cfg)
    }
  }).catch();
}

/** 启动服务热更新，只针对服务入口模块，级联模块暂时不支持 */
export function watchHotUpdate() {

  started = true;

  const watcher = watch(servicesDir, {
    depth: 9,
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true,
    atomic: 200,
  });

  watcher.on("change", (absPath) => {
    debug('file change', absPath);
    deleteCacheForUpdated(absPath);
  });

  process.on('SIGINT', () => {
    watcher.close();
  });
}

/** 都是按照解析完的 module.filename 来记录关系的 */
const depsMap = new Map<string, Set<string>>();

async function collectWhoDependMe(parentModule: NodeModule) {
  // if (!parentModule) return;
  const absFileName = parentModule.filename;
  const promises = parentModule.children.map(async subModule => {
    const subPath = subModule.filename;
    // 可能会出现两个模块互相引用的情况造成死循环
    // debug('collectWhoDependMe', absFileName.substring(ServiceDir.length), subPath.substring(ServiceDir.length));
    if (!subPath.startsWith(servicesDir)) return;
    if (subModule.loaded === false) return; // 此时必定 loaded=true

    // inner 依赖了一个 faas，注入自标注路径，来支持内部调用寻址
    if (subModule.exports.faas) {
      const endPos = subPath.length - extname(subPath).length
      subModule.exports.faas.faasPath = subPath.substring(prefixLenght, endPos);
    }

    let depSet = depsMap.get(subPath);
    let isNew = !depSet;
    if (isNew) {
      // submodule 第一次被依赖
      depSet = new Set<string>();
      depsMap.set(subPath, depSet);
    }
    // 如果判断 subModule 可能会改变，则加入到依赖跟踪中
    depSet!.add(absFileName);
    // if (subPath.endsWith('/test1.ts')) {
    //   debug('track', subPath, [...depsMap.get(subPath)!]);
    // }

    if (depsMap.get(parentModule.filename)?.has(subPath)) return; // 防止循环引用造成 stack overflow
    await collectWhoDependMe(subModule);
    if (isNew && isBaasModule(subModule)) {
      // 依赖了一个 baas，确保在依赖 tree 都处理完再处理状态模块的初始化
      await registerBaas(subModule);
    }
  });
  await Promise.all(promises);
}

function deleteCacheForUpdated(updatedFileName: string) {
  debug('delete cache', updatedFileName);

  // 如果是 BAAS 模块更新，老的 BAAS 资源需要先清除掉释放资源
  const m = require.cache[updatedFileName];
  if (m && isBaasModule(m)) {
    destroyOldBaas(m);
  }

  // 从模块缓存是删除，这样再次加载改模块就能看到更新的版本
  delete require.cache[updatedFileName];

  // 如果是目录模块更新，则要更新内部的配置链中的节点
  if (updatedFileName.endsWith('/index.ts')) {
    updateConfig(updatedFileName);
  }

  // 回溯再无引用者，则退出
  const importers = depsMap.get(updatedFileName);
  // if (updatedFileName.endsWith('/test1.ts')) {
  //   debug('on delete importers', updatedFileName, importers);
  // }

  depsMap.delete(updatedFileName); // 依赖自己的部分全完成

  if (!importers) {
    if (!updatedFileName.endsWith('./test.ts')) {
      debug('top depender modified', updatedFileName);
      const testPath = updatedFileName.replace(/\.ts/, '.test.ts');
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
export let registerDep = async (absServicePath: string) => {
  if (!started) return;
  debug('collecting from', absServicePath);
  await collectWhoDependMe(require.cache[absServicePath]!);
}


// 只有开发环境才会启用自动热更新，生产环境可以节省资源
if (process.env.NODE_ENV === 'development') {
  import('./hotUpdate').then(hotUpdateModule => {
    watchHotUpdate();
  });
} else {
  registerDep = async () => { };
}
