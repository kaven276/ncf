import { resolved, getDebug } from '@ncf/microkernel';
import state1 from './state1';

const debug = getDebug(module);

interface State {
  state1: typeof state1,
  state2: number,
}

/** 一个状态模块依赖另外一个状态模块 */
export let state2 = resolved<State>(async (addDisposer) => {

  await new Promise(r => setTimeout(r, 100)); // 模拟等待
  // 状态可以自行改变
  const timer = setInterval(() => {
    if (Math.random() < 0.1) {
      // 证明可以整体改变 default export 并被 import 方看到变化
      // ，只能改变其内部的成员
      state2 = {
        state1: {
          count: 0,
        },
        state2: 0,
      }
    } else {
      // debug('interval occurred', state2);
      // const state = module.exports.default as typeof state2;
      state2.state1.count++;
      state2.state2++;
    }
  }, 2000);

  addDisposer(async () => clearInterval(timer))

  return {
    state1,
    state2: 2,
  }
});

// 直接变更 export let xxx 的值是不行的，importer 看到的是 export default 指向上一版 state，如果 importer 直接 import 原版值不通过 default 引用则可行
// export default state2;
