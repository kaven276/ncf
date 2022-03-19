import { getProxiedPath } from '@ncf/engine';

export async function faas(req: any) {
  const targetPath = getProxiedPath();
  return {
    targetPath,
    req,
  };
}
