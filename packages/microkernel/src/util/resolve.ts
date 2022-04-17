import { Module } from 'module';

export const ProjectDir = process.cwd();

//@ts-ignore
export const jsExt = Module._extensions['.ts'] ? '.ts' : '.js';
