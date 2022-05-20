#!/usr/bin/env -S node -r ts-node/register -r tsconfig-paths/register --no-warnings

// 使用 typescript 开发 command line 的范例
// 执行 ./src/cmd.ts 验证

import { readFile } from 'node:fs/promises';

// 显示本文件自己的内容
readFile(__filename, { encoding: 'utf8' }).then(console.log);
