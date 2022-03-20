import { level2 } from './level2';
export function level1() {
  console.log('in level1');
  return 2 * level2();
}
