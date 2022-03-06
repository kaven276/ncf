/*
 * 请求响应规格检查模块
 */

import { ISpec } from './faas1.spec';
import Ajv, { JSONSchemaType } from 'ajv';
const ajv = new Ajv();


const schema1: JSONSchemaType<ISpec["request"]> = {
  type: "object",
  properties: {
    user: { type: "string" }
  },
  required: [],
  additionalProperties: false
}

const validate1 = ajv.compile(schema1);

export function checkRequest(req: any) {
  // if (!req.user) {
  //   throw Error('请求中没有user字段');
  // }
  if (!validate1(req)) {
    return validate1.errors;
  }
}

export function checkResponse(resp: any) {
  if (!resp.name) {
    throw Error('响应中没有name字段');
  }
}
