import { RewriteFilePath } from '../util/resolve';

type Rewrite = (path: string) => string;


/** 项目配置的中间件清单，顺序重要 */
let rewrite: Rewrite | undefined;

/** 给 executor 调用改写路径 */
export async function doRewrite(path: string) {
  if (!rewrite) {
    const rewriteModule = await import(RewriteFilePath).catch(() => ({
      rewrite: (path: string) => path,
    }));
    rewrite = rewriteModule.rewrite;
  }
  return rewrite!(path);
}
