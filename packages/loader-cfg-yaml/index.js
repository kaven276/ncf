const { resolved, throwServiceError } = require('@ncf/microkernel');
const { Module } = require('module');
const { readFile } = require('fs/promises');
const { load } = require("js-yaml");

// loader 是异步的，promise 返回结果
// 这样一些非常大的文件，可以被 loader 分片处理，防止独占时间循环造成主线程卡死

Module._extensions['.yaml'] = Module._extensions['.yml'] = function loaderYAML(m, filename) {
  m.exports = {
    content: resolved(() => readFile(filename, { 'encoding': 'utf8' })
      .then(txt => load(txt, { json: true }))
      .catch(e => ({ error: e }))),
    faas: async () => {
      const result = m.exports.content;
      if (result.error) {
        throwServiceError(1, 'loader-cfg-yaml convert failed', result.error);
      }
      return result;
    },
  }
}
