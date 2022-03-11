import { asyncLocalStorage } from '@ncf/engine';

/** 测试从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  const threadStore = asyncLocalStorage.getStore()!;
  //@ts-ignore
  const user = threadStore.jwt.sub;
  return {
    'name': 'test1',
    user,
  }
}
