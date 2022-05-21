import { getJWTStruct, getJWT } from '@ncf/mw-jwt';
import { getCaller } from '@ncf/microkernel';

// 对于调用期间的 async local state，可以扩展其类型定义的内容
declare module '@ncf/microkernel' {
  interface ICallState {
    extra1?: string,
    extra2?: string,
  }
}

/** 测试从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  return {
    caller: getCaller(),
    jwt: getJWT(),
    jwtStruct: getJWTStruct(),
  }
}
