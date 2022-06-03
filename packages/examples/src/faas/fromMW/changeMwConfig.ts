import { mwInstance } from 'src/mw/ClassDemo';

/** 展示通过 faas 修改中间件的 class instance 中的 delay 配置 */
export const faas = async () => {
  const oldDelay: number = mwInstance.delay;
  mwInstance.setDelay(0);
  const newDelay: number = mwInstance.delay;
  return { oldDelay, newDelay }
}
