import { Module } from 'module';


export const ProjectDir = process.cwd();

//@ts-ignore
export const tsMode = Boolean(Module._extensions['.ts']);
export const jsExt = tsMode ? '.ts' : '.js';
export const MoundDir = tsMode ? 'src' : 'dist';
export const ServiceDir = `${ProjectDir}/${MoundDir}/faas`;
export const prefixLength = ServiceDir.length;

/** 将路径按照 js/ts 运行时调整到匹配的完整路径 */
export function pathPattern(fpath: string) {
  return tsMode ? `src/${fpath}.ts` : `dist/${fpath}.js`;
}
