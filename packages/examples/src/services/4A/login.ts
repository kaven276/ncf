import { throwServiceError, getDebug } from '@ncf/engine';
import { setRandomLatencyConfig } from 'src/middlewares/randomLatency';
import { signToken } from '@ncf/mw-jwt';

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
    const token = signToken(req.user, {
      expiresIn: 3600,
    });
    return { token };
  }
  throwServiceError(1, '用户名密码错误');
}
