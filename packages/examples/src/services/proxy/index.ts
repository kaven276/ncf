import { getProxiedPath } from '@ncf/engine';

/** 目录模块导出 faas 代表该目录路径使用反向代理 */
export async function faas(req: any) {
  const targetPath = getProxiedPath();
  return {
    targetPath,
    req,
  };
}
