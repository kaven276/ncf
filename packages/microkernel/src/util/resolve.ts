import { Module } from 'module';
import { normalize, join, dirname, basename, extname, posix } from 'node:path';

/** NCF 应用工程的根路径 */
export const ProjectDir = process.cwd();


/** 是否是启用了 .ts 模块加载器，也即采用 ts-node 方式运行的 */
//@ts-ignore
export const tsMode = Boolean(Module._extensions['.ts']);
/** 当前是直接运行 .ts 模块还是 .js 模块 */
export const jsExt = tsMode ? '.ts' : '.js';
/** 应用代码是挂载到 src 还是编译目标目录 dist */
export const MoundDir = tsMode ? 'src' : 'dist';
/** faas root dir path */
export const ServiceDir = normalize(`${ProjectDir}/${MoundDir}/faas`);
/** faas root dir path length */
export const prefixLength = ServiceDir.length;

/** 将路径按照 js/ts 运行时调整到匹配的完整路径 */
export function pathPattern(fpath: string) {
  return normalize(tsMode ? `src/${fpath}.ts` : `dist/${fpath}.js`);
}

/** 中间件配置文件路径 */
export const MiddlewareFilePath = normalize(`${ProjectDir}/${MoundDir}/middlewares${jsExt}`);

/** faas 模块文件系统路径(linux/windows) 对应到服务调用路径 faasPath */
export function absPathToFaasPath(absPath: string): string {
  const path1 = absPath.substring(prefixLength);
  const path2 = join(dirname(path1), basename(path1, extname(path1)));
  return posix.normalize(path2);
}
