import { getProxiedPath } from '@ncf/engine';

export const proxy = true;

export async function faas(req: any) {
  const targetPath = getProxiedPath();
  return {
    targetPath,
    req,
  };
}
