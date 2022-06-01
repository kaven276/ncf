import repl from 'node:repl';
import { getDebug } from './util/debug';
import { jsExt, prefixLength, ServiceDir } from './util/resolve';
import { writeFile, createWriteStream } from 'node:fs';
import { addDisposer } from './util/addDisposer';
import { Readable } from 'node:stream';
import { innerCall } from './innerCall';
import { sep, extname, basename } from 'node:path';
import { Module } from 'module';

const debug = getDebug(module);
let lastModifiedFaasModulePath: string;

const iv = repl.start({ prompt: '>>> ' });

// 处于 pm2 守护模式下，不开放 REPL
if (process.send) {
  iv.close();
} else {
  addDisposer(() => iv.close());
}
let autoTest = false;

async function doTest() {
  if (!lastModifiedFaasModulePath) {
    console.log('还没有变更的 faas 模块，无测试目标！');
  } else {
    const jsExt = extname(lastModifiedFaasModulePath);
    console.log(`about to test ${lastModifiedFaasModulePath}`);
    const testPath = lastModifiedFaasModulePath.replace(jsExt, '.test' + jsExt);
    let testModule = await import(testPath).catch(() => ({}));
    if (!testModule.faas) {
      // 没有定义单元测试，自动默认为无参数执行对应的模块
      testModule = {
        faas: async () => innerCall(lastModifiedFaasModulePath.substring(prefixLength).replace(jsExt, ''))
      };
    }
    let resp: any;
    try {
      resp = await testModule.faas();
    } catch (e: unknown) {
      const respPath = lastModifiedFaasModulePath.replace(jsExt, '.resp.json');
      writeFile(respPath, (e as Error).toString(), { encoding: 'utf8' }, () => { });
      return;
    }
    console.log(lastModifiedFaasModulePath, resp);
    const isHTML = (typeof resp === 'string' && resp.startsWith('<'));
    const isBuffer = resp instanceof Buffer;
    const isStream = resp instanceof Readable;
    if (isHTML) {
      const respPath = lastModifiedFaasModulePath.replace(jsExt, '.resp.html');
      writeFile(respPath, resp, { encoding: 'utf8' }, () => { });
    } else if (isBuffer) {
      //@ts-ignore
      const respPath = lastModifiedFaasModulePath.replace(jsExt, `.resp.${resp.ext ?? 'bin'}`);
      writeFile(respPath, resp, () => { });
    } else if (isStream) {
      const respPath = lastModifiedFaasModulePath.replace(jsExt, '.resp.jpg');
      const f = createWriteStream(respPath);
      resp.pipe(f);
    } else if (!!resp) {
      const respPath = lastModifiedFaasModulePath.replace(jsExt, '.resp.json');
      console.log(respPath);
      writeFile(respPath, JSON.stringify(resp, null, 2), { encoding: 'utf8' }, () => { });
    }
  }
}
iv.defineCommand('test', doTest);
iv.defineCommand('auto', () => {
  if (autoTest) {
    console.info('关闭 autoTest');
  } else {
    console.info('启用 autoTest');
  }
  autoTest = !autoTest;
});

iv.defineCommand('quit', function saybye() {
  console.log('Goodbye!');
  this.close();
});

/** 统一收集 faas 模块变更，收集所有来自 faas 引用的模块的变更 */
export function onFaasModuleChange(absPath: string) {
  if (!absPath.startsWith(ServiceDir)) {
    return; // 不在项目 faas 目录内
  }

  if (basename(absPath).match(/(\.(resp|baas|spec|check)\.|README.md)/)) {
    return; // 属于自动测试结果等非 faas 文件文件，不处理
  }

  const ext = extname(absPath);
  //@ts-ignore
  if (!Module._extensions[ext]) return; // 不是注册的模块类型不做处理

  // 对于 windows 平台，转成 linux 路径
  if (sep === "\\") {
    absPath = absPath.replaceAll(sep, '/');
  }

  if (absPath.endsWith('.test' + jsExt)) {
    lastModifiedFaasModulePath = absPath.replace('.test.ts', ext);
  } else {
    lastModifiedFaasModulePath = absPath;
  }
  debug('faas/test change', absPath);
  if (autoTest) {
    doTest();
  }
  // iv.context.faasPath = absPath;
}
