import { level1 } from './level1';
import { state2 } from './state2';

/** 查看 level2 ts 改变，是否再访问 start，看到是更新后的代码 */
export async function faas(req: any) {
  console.log(state2);
  return {
    call: (req?.multi ?? 2) * level1(),
    state: state2,
  };
}
