import { getJWT, getJWTStruct } from '@ncf/mw-jwt';
import { throwServiceError } from '@ncf/microkernel';

/** 测试通过专用 API 二维从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  const jwtStruct = getJWTStruct();
  if (!jwtStruct) {
    throwServiceError(401, 'JWT凭证无效');
  }
  return {
    JWT: getJWT(),
    jwtStruct: getJWTStruct(),
  }
}
