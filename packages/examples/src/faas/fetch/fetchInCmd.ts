#!/usr/bin/env -S node -r ts-node/register -r tsconfig-paths/register

// 使用 typescript 开发 command line 的范例
// 执行 ./src/faas/fetch/fetchInCmd.ts 验证

import { version } from 'process';
console.log(version);

// --experimental-fetch since v16.15.0 support
export const url = 'https://openapi.apifox.cn/#media-type-对象';
fetch(url).then(resp => resp.text()).then(console.log);
