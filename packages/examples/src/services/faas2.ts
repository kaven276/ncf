import { getJWTStruct } from '@ncf/mw-jwt';

// 对于调用期间的 async local state，可以扩展其类型定义的内容
declare module '@ncf/engine' {
  interface ICallState {
    extra1: string,
    extra2: string,
  }
}

/** 测试从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  return getJWTStruct();
}
