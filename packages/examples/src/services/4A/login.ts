import { throwServiceError } from '@ncf/engine';
import * as jws from 'jws';

interface ILoginInfo {
  user: string,
  password: string,
}

interface Result {
  token: string,
}

/** 测试通过专用 API 二维从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas(req: ILoginInfo): Promise<Result | undefined> {
  if (['test', 'admin'].includes(req.user) && req.password === '123456') {
    const token = jws.sign({
      header: { alg: 'HS256' },
      payload: {
        sub: req.user,
      },
      secret: 'has a van',
    });
    return { token };
  }
  throwServiceError(1, '用户名密码错误');
}
