import { Module } from 'module';

export const ProjectDir = process.cwd();

//@ts-ignore
const tsMode = Booean(Module._extensions['.ts']);
export const jsExt = tsMode ? '.ts' : '.js';
export const MoundDir = tsMode ? 'src' : 'dist';
