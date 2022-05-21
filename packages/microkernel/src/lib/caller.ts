// faas 调用者身份信息
import { getCallState } from '../executor';

export interface Caller {
  /** 访问的用户 */
  user?: string,
  /** 访问的组织(多租户时) */
  org?: string,
  /** 访问的应用(当另外一个应用访问时) */
  ak?: string,
}

/** 获取访问者信息 */
export function getCaller() {
  return getCallState().caller;
}
