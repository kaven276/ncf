import { throwServiceError, getDebug } from '@ncf/microkernel';
import { cfgLatency } from 'src/mw/randomLatency';
import { signToken } from '@ncf/mw-jwt';
import { env } from 'src/env';

interface ILoginInfo {
  user: string,
  password: string,
}

interface Result {
  token: string,
}

export interface ISpec {
  path: '/4A/login',
  request: ILoginInfo,
  response: Result,
}

export const config = {
  ...cfgLatency.set({
    maxLatencyMs: 0
  }),
}

const debug = getDebug(module);

/** 测试通过专用 API 二维从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas(req: ILoginInfo): Promise<Result | undefined> {
  debug(req);
  if (['test', 'admin'].includes(req.user) && req.password === '123456') {
    const token = signToken(req.user, {
      expiresIn: env.JWT_EFFECT_TIME,
    });
    return { token };
  }
  throwServiceError(1, '用户名密码错误');
}
