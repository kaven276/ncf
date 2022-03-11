import { asyncLocalStorage } from '@ncf/engine';

// 对于调用期间的 async local state，可以扩展其类型定义的内容
declare module '@ncf/engine' {
  interface ICallState {
    extra1: string,
    extra2: string,
  }
}

/** 测试从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  const threadStore = asyncLocalStorage.getStore()!;
  // threadStore.extra1; 这里有代码提示 extra1 extra2
  //@ts-ignore
  const user = threadStore.jwt.sub;
  return {
    'name': 'test1',
    user,
  }
}
