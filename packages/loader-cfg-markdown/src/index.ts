import { Module } from 'module';
import { readFile } from 'fs/promises';
import { loadMarkdown } from "./loadMarkdown";

// loader 是异步的，promise 返回结果
// 这样一些非常大的文件，可以被 loader 分片处理，防止独占时间循环造成主线程卡死

//@ts-ignore
Module._extensions['.md'] = Module._extensions['.markdown'] = function loaderMarkdown(m: any, filename: string) {
  const contentPromise = readFile(filename, { 'encoding': 'utf8' }).then(loadMarkdown);
  m.exports = {
    faas: async () => contentPromise,
  }
}
