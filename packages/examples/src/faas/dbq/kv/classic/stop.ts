import { state } from './timer.state';

/** 停掉取到期延迟任务的 interval */
export const faas = async () => {
  if (!state.timer) {
    return '没有设置定时器，无需清理';
  }
  clearInterval(state.timer);
  return '定时器已清理';
}
