
import { IApi } from './lib/faas';
import { request as httpRequest, RequestOptions, Agent } from 'node:http';
import { getDebug } from './util/debug';
import { consumeBody } from './util/comsumeBody';

const debug = getDebug(module);
const agent = new Agent({ keepAlive: true });
let fixedRequestOptions: RequestOptions = {
  agent,
  method: 'POST',
  protocol: 'http:',
  hostname: 'localhost',
  port: 8000,
  headers: {
    'content-type': 'application/json',
    'x-outer': '1',
  }
}
let requestOption: RequestOptions = fixedRequestOptions;

/** 配置被调用服务所在的 ncf http 协议网关地址，特别是 host,port；默认 localhost:8000 */
export function setOuterCallAddr(opts: RequestOptions) {
  requestOption = Object.assign({}, fixedRequestOptions, opts);
}

/** 通过 ncf gateway 发起 faas 服务调用 */
export function outerCall<T extends IApi>(path: T["path"], request: T["request"]): Promise<T["response"]> {
  debug('outerCall', path, request);
  return new Promise((resolve, reject) => {
    const req = httpRequest({ ...requestOption, path });
    req.end(JSON.stringify(request));
    req.once('response', (resp) => {
      // console.log(resp.statusCode, resp.headers);
      if (resp.statusCode === 200) {
        consumeBody(resp).then(buf => {
          const json = JSON.parse(buf.toString('utf8'));
          // console.log(json);
          resolve(json.data);
        });
      } else {
        consumeBody(resp).then(buf => {
          console.error(buf.toString('utf8'));
          reject();
        });
      }
    });
  });
}
