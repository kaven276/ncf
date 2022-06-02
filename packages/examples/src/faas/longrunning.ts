import { setTimeout } from 'node:timers/promises';

/** 测试一个长任务是否可以 survive SIGHUP，gracefule quit */
export const faas = async () => {
  await setTimeout(10 * 1000);
  return 'sorry let you wait too long';
}
