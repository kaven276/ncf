import { faas as dequeueDued } from './iterate';
import { state } from './timer.state';

/** 启动取到期延迟任务的 interval */
export const faas = async () => {
  state.timer = setInterval(() => dequeueDued(), 1000);
  return '已开启到期延迟任务取出执行每秒定时任务';
}
