import { innerCall } from '@ncf/microkernel';

export const faas = async () => {
  return innerCall('/composite/nested/start', { multi: 10 });
}

import tap from 'tap';
/** 如果是顶层模块，认为是要测试任务 */
export const task = (require.main === module) && tap.test('start', async (t) => {
  await faas();
});
