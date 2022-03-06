import { watch } from 'chokidar';

/** 启动服务热更新，只针对服务入口模块，级联模块暂时不支持 */
export function watchHotUpdate() {
  const ServiceDir = process.cwd() + '/src/services'
  const watcher = watch(ServiceDir, {
    depth: 9,
    persistent: true,
  });

  watcher.on("change", (path) => {
    console.log(path);
    delete require.cache[path];
  });
}

