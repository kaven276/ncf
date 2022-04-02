import { useLifecycle } from '@ncf/microkernel';
import state1 from './state1';

let timer: NodeJS.Timer;

/** 一个状态模块依赖另外一个状态模块 */
let state2 = useLifecycle(module, {
  initialize: async () => {
    await new Promise(r => setTimeout(r, 100)); // 模拟等待
    // 状态可以自行改变
    timer = setInterval(() => {
      if (Math.random() < 0.5) {
        // 证明可以整体改变 default export 并被 import 方看到变化
        (module.exports.default as typeof state2) = {
          state1: {
            count: 0,
          },
          state2: 0,
        }
      } else {
        const state = module.exports.default as typeof state2;
        state.state1.count++;
        state.state2++;
      }
    }, 3000);

    return {
      state1,
      state2: 2,
    }
  },
  destroy: async () => {
    clearInterval(timer);
  },
});

export default state2;
