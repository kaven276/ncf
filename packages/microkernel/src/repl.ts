import repl from 'node:repl';
import { getDebug } from './util/debug';
import { jsExt } from './util/resolve';
import { writeFile } from 'node:fs';
import { addDisposer } from './util/addDisposer';

const debug = getDebug(module);
let lastModifiedFaasModulePath: string;

const iv = repl.start({ prompt: '>>> ' });
addDisposer(() => iv.close());
let autoTest = false;

async function doTest() {
  if (!lastModifiedFaasModulePath) {
    console.log('还没有变更的 faas 模块，无测试目标！');
  } else {
    console.log(`about to test ${lastModifiedFaasModulePath}`);
    const testPath = lastModifiedFaasModulePath.replace(jsExt, '.test' + jsExt);
    const testModule = await import(testPath).catch(() => ({}));
    if (!testModule.faas) return;
    const resp = await testModule.faas();
    const isHTML = (typeof resp === 'string' && resp.startsWith('<'));
    if (isHTML) {
      const respPath = lastModifiedFaasModulePath.replace(jsExt, '.resp.html');
      writeFile(respPath, resp, { encoding: 'utf8' }, () => { });
    } else {
      const respPath = lastModifiedFaasModulePath.replace(jsExt, '.resp.json');
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

/** 统一收集 faas 模块变更 */
export function onFaasModuleChange(absPath: string) {
  if (!absPath.endsWith('.ts')) return;
  if (absPath.endsWith('.test.ts')) {
    lastModifiedFaasModulePath = absPath.replace('.test.ts', '.ts');
  } else {
    lastModifiedFaasModulePath = absPath;
  }
  debug('faas/test change', absPath);
  if (autoTest) {
    doTest();
  }
  // iv.context.faasPath = absPath;
}
