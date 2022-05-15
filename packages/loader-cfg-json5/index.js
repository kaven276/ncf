const { Module } = require('module');
const { readFile } = require('fs/promises');
const json5 = require("json5");

// loader 是异步的，promise 返回结果
// 这样一些非常大的文件，可以被 loader 分片处理，防止独占时间循环造成主线程卡死

//@ts-ignore
Module._extensions['.json5'] = function loaderJSON5(m, filename) {
  const contentPromise = readFile(filename, { 'encoding': 'utf8' }).then(json5.parse);
  m.exports = {
    faas: async () => contentPromise,
  }
}

