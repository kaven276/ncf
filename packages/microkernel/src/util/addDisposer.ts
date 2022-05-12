import { setImmediate } from 'node:timers';

/** 已存在的带进程中断时需销毁的 */
const existsList: Function[] = [];

/** 注册当进程收到退出信号后需要执行的清理回调函数 */
export function addDisposer(cb: Function) {
  existsList.push(cb);
}

export function shutdown() {
  existsList.forEach(cb => cb());
  // 如果超过指定时间，相关事件监听还没清除掉完成正常退出则直接强制退出进程
  // setTimeout(() => process.exit(1), 3000);
}

process.once('SIGINT', shutdown);


setImmediate(() => {
  const task = require.main!.exports.task;
  if (task && task.then) {
    console.dir('-------');
    task.then(shutdown)
  }
});
