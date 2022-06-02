/*
 * 请求响应规格检查模块，一般独立于 faas 实现模块，因为需要能独立使用，如提供 swagger 支持，或者拷贝全部 Spec/Validator 文件给调用方开发调式使用
 * 检查 middleware 可以提供带 ?schema 的检查，不执行 faas，而是直接下载 schema。
 */

import { ISpec } from './faas1.spec';
import { Schema } from '@ncf/mw-validator';

export const schema: Schema<ISpec> = {
  requestSchema: {
    type: "object",
    properties: {
      user: { type: "string", default: 'anonymous' },
      age: { type: "number", minimum: 18 },
    },
    required: ['user'],
    additionalProperties: true,
  },
  responseSchema: {
    type: "object",
    properties: {
      name: { type: 'string' },
      count: { type: 'integer' },
      PI: { type: "number" }
    },
    required: ['name', 'count', 'PI'],
    additionalProperties: true,
  },
}
