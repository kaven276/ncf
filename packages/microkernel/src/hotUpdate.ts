import { watch } from 'chokidar';
import { getDebug } from './util/debug';
import { root } from './lib/config';
import { servicesDir } from './util/resolve';
const ServiceDir = process.cwd() + '/src/services';

const debug = getDebug(module);
let started = false;

/** 启动服务热更新，只针对服务入口模块，级联模块暂时不支持 */
export function watchHotUpdate() {

  started = true;

  const watcher = watch(ServiceDir, {
    depth: 9,
    persistent: true,
  });

  watcher.on("change", (path) => {
    deleteCacheFromUpated(path);

    if (path.endsWith('/index.ts')) {
      // 目录配置改变的话，更新 config prototype chain
      debug('config changed for', path.substring(ServiceDir.length));
      const dirs = path.substring(ServiceDir.length + 1).split('/');
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
      import(path).then(dirModule => {
        if (dirModule.config) {
          Object.assign(cfgNode.cfg, dirModule.config);
        }
      }).catch();
    }
  });
}

/** 都是按照解析完的 module.filename 来记录关系的 */
const depsMap = new Map<string, Set<string>>();

function collectWhoDependMe(parentModule: NodeModule) {
  // if (!parentModule) return;
  const absFileName = parentModule.filename;
  parentModule.children.forEach(subModule => {
    // 可能会出现两个模块互相引用的情况造成死循环
    // debug('collectWhoDependMe', absFileName.substring(ServiceDir.length), subModule.filename.substring(ServiceDir.length));
    if (!subModule.filename.startsWith(ServiceDir)) return;
    if (subModule.loaded === false) return;
    let depSet = depsMap.get(subModule.filename);
    if (!depSet) {
      depSet = new Set<string>();
      depsMap.set(subModule.filename, depSet);
    }
    // 如果判断 subModule 可能会改变，则加入到依赖跟踪中
    depSet.add(absFileName);
    collectWhoDependMe(subModule);
  });
}

function deleteCacheFromUpated(updatedFileName: string) {
  debug('delete cache', updatedFileName);
  delete require.cache[updatedFileName];
  const importers = depsMap.get(updatedFileName);
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
  for (let importer of importers) {
    if (importer === updatedFileName) {
      process.exit();
    }
    deleteCacheFromUpated(importer);
  }
}

export function registerDep(absServicePath: string) {
  if (!started) return;
  collectWhoDependMe(require.cache[absServicePath]!);
}

