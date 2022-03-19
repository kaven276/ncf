import { getProxiedPath } from '@ncf/engine';
import { setRandomLatencyConfig } from '../../middlewares/randomLatency';

/** 目录模块导出 faas 代表该目录路径使用反向代理 */
export async function faas(req: any) {
  const targetPath = getProxiedPath();
  return {
    targetPath,
    req,
  };
}

/** 说明代理模块也可以受中间及其配置影响，和实体 faas 模块一样 */
export const config = {
  ...setRandomLatencyConfig({
    maxLatencyMs: 5000,
  }),
}
