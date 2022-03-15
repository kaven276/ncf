import { getJWT, getJWTStruct } from '../middlewares/mw-jwt';


/** 测试通过专用 API 二维从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas() {
  return {
    JWT: getJWT(),
    jwtStruct: getJWTStruct(),
  }
}
