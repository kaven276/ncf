/*
 * 请求响应规格检查模块
 */

import { ISpec } from './faas1.spec';
import { JSONSchemaType } from 'ajv';

export const requestSchema: JSONSchemaType<ISpec["request"]> = {
  type: "object",
  properties: {
    user: { type: "string", default: 'anonymous' },
    age: { type: "number" },
  },
  required: ['user'],
  additionalProperties: true,
}

export const responseSchema: JSONSchemaType<ISpec["response"]> = {
  type: "object",
  properties: {
    name: { type: 'string' },
    count: { type: 'integer' },
    PI: { type: "number" }
  },
  required: ['name', 'count', 'PI'],
  additionalProperties: true,
}

export function checkResponse_(resp: any) {
  if (!resp.name) {
    throw Error('响应中没有name字段');
  }
}
