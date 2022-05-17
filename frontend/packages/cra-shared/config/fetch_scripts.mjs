/**
 * 执行本脚本将抓取所有用到的 externals 化的 js 脚本到 npm 目录。
 * 后面可以拷贝到静态文件服务器供前端各个应用访问。
 * 生成 node fetch_scripts.mjs && echo ok
 * 测试 serve -p 8000 --cors npm 
 */

import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { ensureDir } from 'fs-extra';
// import mkdirp from 'mkdirp';
// console.log(mkdirp, mkdirp.sync);

const prefix = 'https://unpkg.com';

import { externalsSrcConfigMaker } from './externalsResource.js';

const scripts = new Set();
Object.values(externalsSrcConfigMaker({ isDev: true, isAntd3: true, isImmutable4: true })).forEach(item => {
  scripts.add(item.src);
});
Object.values(externalsSrcConfigMaker({ isDev: false, isAntd3: false, isImmutable4: false })).forEach(item => {
  scripts.add(item.src);
});
const list = [...scripts];
console.log(list);

list.forEach((path) => {
  fetchOne(path);
});

function fetchOne(path) {
  fetch(`${prefix}/${path}`).then(async resp => {
    const wPath = resolve(`./npm/${path}`);
    await ensureDir(dirname(wPath));
    const file = createWriteStream(wPath);
    // console.log(wPath);
    let fin = false;
    setTimeout(() => {
      if (fin) return;
      console.log(path, 'time out');
    }, 5000);
    resp.body.pipe(file).on('finish', () => {
      fin = true;
      console.info(path, 'finished');
    });
    resp.body.on('error', () => {
      fin = true;
      console.error(path, 'read error');
    });
  }).catch(e => {
    console.error(path);
  });
}
