import { Module } from 'module';
import { readFile } from 'fs/promises';
import { parseStringPromise } from "xml2js";

// loader 是异步的，promise 返回结果
// 这样一些非常大的文件，可以被 loader 分片处理，防止独占时间循环造成主线程卡死

//@ts-ignore
Module._extensions['.xml'] = function loaderXML(m: any, filename: string) {
  const contentPromise = readFile(filename, { 'encoding': 'utf8' }).then(txt => parseStringPromise(txt));
  m.exports = {
    faas: async () => contentPromise,
  }
}
