/** 已存在的带进程中断时需销毁的 */
const existsList: Function[] = [];

/** 注册当进程收到退出信号后需要执行的清理回调函数 */
export function addDisposer(cb: Function) {
  existsList.push(cb);
}

process.once('SIGINT', function () {
  existsList.forEach(cb => cb());
});
