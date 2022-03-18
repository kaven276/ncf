import { watch } from 'chokidar';
import { getDebug } from './util/debug';
import { root } from './lib/config';
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
    delete require.cache[path];
    const depServiceSet = depsMap.get(path);
    if (depServiceSet) {
      depServiceSet.forEach(servicePath => {
        delete require.cache[servicePath];
      })
    }
    if (path.endsWith('/config.ts')) {
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

const depsMap = new Map<string, Set<string>>();
export function registerDep(absServicePath: string) {
  if (!started) return;
  const children = require.cache[absServicePath]!.children;
  if (!children) return;
  children.forEach((depModule) => {
    // 只对服务目录内的依赖登记
    if (!depModule.id.startsWith(ServiceDir)) return;
    const depSet = depsMap.get(depModule.id) || (() => {
      const m = new Set<string>();
      depsMap.set(depModule.id, m);
      return m;
    })();
    depSet.add(absServicePath);
  })
}
