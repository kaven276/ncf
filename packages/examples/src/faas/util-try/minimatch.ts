import match from 'minimatch';

const matchPatterns = [
  '/dir1/*/file',
  '/dir2/*/file',
]

interface IRequest {
  /** 带匹配的路由字符串 */
  pathname: string,
}

/** 测试 minimatch 路由匹配 */
export async function faas(req: IRequest) {
  const routePath = req.pathname ?? '/dir1/dir2/file';
  return matchPatterns.find(pattern => match(routePath, pattern));
}
