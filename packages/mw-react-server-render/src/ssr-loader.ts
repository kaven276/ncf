import { Module } from 'module';
import { readFile } from 'fs/promises';
import { resolved } from '@ncf/microkernel';

const supportSuffixes = ['.ssr.js', '.ssr.css'];

function loaderText(m: NodeModule, filename: string) {
  // console.log(' ----- loading -----', filename);
  const contentPromise = readFile(filename, { 'encoding': 'utf8' });
  contentPromise.then(txt => console.log('loaded', txt));
  m.exports = {
    __esModule: true,
    default: resolved<string>(async () => contentPromise),
  };
};

export function addLoader() {
  supportSuffixes.forEach(suf => {
    // @ts-ignore
    Module._extensions[suf] = loaderText;
  });
}

