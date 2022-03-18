import { throwServiceError, getDebug } from '@ncf/engine';
import { sign } from 'jsonwebtoken';
import { setRandomLatencyConfig } from 'src/middlewares/randomLatency';
import { getSecret, getJwtOption } from '../../middlewares/mw-jwt';

interface ILoginInfo {
  user: string,
  password: string,
}

interface Result {
  token: string,
}

export const config = {
  ...setRandomLatencyConfig({
    maxLatencyMs: 0
  }),
}

const debug = getDebug(module);

/** 测试通过专用 API 二维从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas(req: ILoginInfo): Promise<Result | undefined> {
  if (['test', 'admin'].includes(req.user) && req.password === '123456') {
    const token = sign({
      user: req.user,
    }, getSecret(), {
      expiresIn: 3600,
      ...getJwtOption(),
    });
    return { token };
  }
  throwServiceError(1, '用户名密码错误');
}
