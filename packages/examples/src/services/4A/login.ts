import { throwServiceError, IConfig, createGetConfig, getDebug } from '@ncf/engine';
import { sign } from 'jsonwebtoken';
import { randomLatency, setRandomLatencyConfig } from 'src/middlewares/randomLatency';

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
const getConfig = createGetConfig(module);

/** 测试通过专用 API 二维从 asyncLocalStorage 中拿到 jwt 信息，用户标识等等 */
export async function faas(req: ILoginInfo): Promise<Result | undefined> {
  const cfg: IConfig = getConfig()!;
  debug('config', cfg[randomLatency.configKey!]);
  console.dir(cfg);
  console.log(JSON.stringify(cfg));
  for(let n in cfg) {
    console.log(n, cfg[n])
  }
  if (['test', 'admin'].includes(req.user) && req.password === '123456') {
    const token = sign({
      user: req.user,
    }, 'has a van', {
      expiresIn: 3600,
      issuer: 'NCF',
      subject: 'examples',
    });
    return { token };
  }
  throwServiceError(1, '用户名密码错误');
}
