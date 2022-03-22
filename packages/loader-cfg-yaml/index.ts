import { Module } from 'module';
import { readFile } from 'fs/promises';
import { load } from "js-yaml";

// loader 是异步的，promise 返回结果
// 这样一些非常大的文件，可以被 loader 分片处理，防止独占时间循环造成主线程卡死

//@ts-ignore
Module._extensions['.yaml'] = Module._extensions['.yml'] = function loaderYAML(m: any, filename: string) {
  const contentPromise = readFile(filename, { 'encoding': 'utf8' }).then(txt => load(txt, { json: true }))
    .catch(e => ({ error: e }));
  m.exports = {
    faas: async () => {
      const result: any = await contentPromise;
      if (result.error) {
        throw {
          code: 1,
          msg: 'loader-cfg-yaml convert failed',
          data: result.error,
        }
      }
      return result;
    },
  }
}
