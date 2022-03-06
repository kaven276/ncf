import { watch } from 'chokidar';
const ServiceDir = process.cwd() + '/src/services';

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
