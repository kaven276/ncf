import { resolved } from '@ncf/microkernel';

interface IState {
  /** 计数 */
  count: number,
}

export let state1 = resolved<IState>(async () => {
  await new Promise(r => setTimeout(r, 100)); // 模拟等待
  return {
    count: 1,
  }
})

export default state1;
