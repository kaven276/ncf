// 测试 esm only 的 fetch 是否可以被集成

import { fetch } from './fetch';

export const faas = async () => {
  // console.dir(fetch);
  return fetch('https://www.bookstack.cn/read/es6-3rd/spilt.3.docs-module.md').then(resp => resp.text());
}
