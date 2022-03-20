import { level1 } from './level1';

/** 查看 level2 ts 改变，是否再访问 start，看到是更新后的代码 */
export async function faas() {
  return 2 * level1();
}
