import { useLifecycle } from '@ncf/microkernel';
import state1 from './state1';

/** 一个状态模块依赖另外一个状态模块 */
let state2 = useLifecycle(module, {
  initialize: async () => {
    await new Promise(r => setTimeout(r, 100)); // 模拟等待
    return {
      state1,
      state2: 2,
    }
  }
});

export default state2;
