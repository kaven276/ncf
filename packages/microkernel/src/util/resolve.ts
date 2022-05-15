import { Module } from 'module';

export const ProjectDir = process.cwd();

//@ts-ignore
const tsMode = Boolean(Module._extensions['.ts']);
export const jsExt = tsMode ? '.ts' : '.js';
export const MoundDir = tsMode ? 'src' : 'dist';
export const ServiceDir = `${ProjectDir}/${MoundDir}/faas`;
export const prefixLength = ServiceDir.length;
