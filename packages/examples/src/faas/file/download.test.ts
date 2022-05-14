import { outerCall } from '@ncf/microkernel';

export const faas = async () => {
  return outerCall('/file/download', { filename: '奖状.jpg'});
}

import tap from 'tap';
/** 如果是顶层模块，认为是要测试任务 */
export const task = (require.main === module) && tap.test('order', async (t) => {
  await faas();
});
