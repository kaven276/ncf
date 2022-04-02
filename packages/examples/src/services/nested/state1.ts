import { useLifecycle } from '@ncf/microkernel';

interface IState {
  /** 计数 */
  count: number,
}

let state1 = useLifecycle<IState>(module, {
  initialize: async () => {
    await new Promise(r => setTimeout(r, 100)); // 模拟等待
    return {
      count: 1,
    }
  }
});

export default state1;
