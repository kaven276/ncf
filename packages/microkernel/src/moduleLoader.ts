import { Module } from 'module';
import { wrap } from 'shimmer';
import { readFileSync } from 'fs';

//@ts-ignore
// const { _cache, _pathCache, Module: m, ...rest } = Module;
// console.dir(rest);
// console.dir(Module.prototype);

// declare module module {
//   interface Module {

//   }
// }

function proxyCompile() {
  // console.dir(Module.prototype._compile);
  //@ts-ignore
  const oldCompile = Module.prototype._compile;
  //@ts-ignore
  Module.prototype._compile = function (content, filename) {

    console.log('Module.prototype._compile', filename, content);
    return oldCompile(content, filename);
  }
}

function wrapLoad() {
  //@ts-ignore
  wrap(Module.prototype, 'load', function (original) {
    return function () {
      console.log('Module.prototype.load', arguments);
      var result = original.apply(this, arguments)
      if (result) {
        console.log('result', result);
      }
      return result;
    };
  })
}

function proxyLoad() {
  //@ts-ignore
  const oldLoad = Module.prototype.load;
  //@ts-ignore
  Module.prototype.load = function () {
    console.log('Module.prototype.load', arguments);
    const result = oldLoad.apply(this, arguments);
    if (result) {
      console.log('result', result);
    }
    return result;
  }
}

function wrapCompile() {
  //@ts-ignore
  wrap(Module.prototype, '_compile', function (original) {
    return function (content: string, filename: string) {
      console.log(1, filename, content);
      if (!filename.endsWith('.ts')) {
        console.log('Module.prototype._compile', arguments);
        console.log('no ts', filename, content);
      }
      var result = original.apply(this, arguments);
      if (result) {
        console.log('result', result);
      }
      return result;
    };
  })
}

function registerJSON5() {
  //@ts-ignore
  Module._extensions['.json5'] = (m: any, filename: string) => {
    const content = readFileSync(filename, { 'encoding': 'utf8' });
    console.log('content', content);
    m.exports = {
      faas: async () => JSON.parse(content),
    }
  }
}

// proxyCompile();
// proxyLoad()

// wrapLoad();
// wrapCompile();

registerJSON5();
