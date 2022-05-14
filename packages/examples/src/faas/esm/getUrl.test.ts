import { innerCall } from '@ncf/microkernel';

export const faas = async () => {
  return innerCall('/esm/getUrl', {});
}

import tap from 'tap';
/** 如果是顶层模块，认为是要测试任务 */
export const task = (require.main === module) && tap.test('getUrl', async (t) => {
  await faas();
});
