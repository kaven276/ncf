import { Module } from 'module';
import { normalize, join, dirname, basename, extname, posix } from 'node:path';

export const ProjectDir = process.cwd();

//@ts-ignore
export const tsMode = Boolean(Module._extensions['.ts']);
export const jsExt = tsMode ? '.ts' : '.js';
export const MoundDir = tsMode ? 'src' : 'dist';
export const ServiceDir = normalize(`${ProjectDir}/${MoundDir}/faas`);
export const prefixLength = ServiceDir.length;

/** 将路径按照 js/ts 运行时调整到匹配的完整路径 */
export function pathPattern(fpath: string) {
  return normalize(tsMode ? `src/${fpath}.ts` : `dist/${fpath}.js`);
}

export const MiddlewareFilePath = normalize(`${ProjectDir}/${MoundDir}/middlewares${jsExt}`);

/** faas 模块文件系统路径(linux/windows) 对应到服务调用路径 faasPath */
export function absPathToFaasPath(absPath: string): string {
  const path1 = absPath.substring(prefixLength);
  const path2 = join(dirname(path1), basename(path1, extname(path1)));
  return posix.normalize(path2);
}
