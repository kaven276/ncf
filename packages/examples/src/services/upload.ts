import { IncomingMessage } from 'http';
import { createWriteStream } from 'fs';
import { Writable } from 'stream'
import { ServiceError } from '@ncf/microkernel';
import { join } from 'path';

/** 等待写结束才返回 */
function waitWritable(writeable: Writable) {
  return new Promise((resolve) => {
    writeable.on('finish', resolve);
  });
}

export const faas = async (req: any, stream: IncomingMessage) => {
  const filename = req.filename || String(Date.now());
  console.log('stream', !!stream, filename);
  /** 上传文件在文件系统的路径 */
  const path: string = join(__dirname, '../../upload', filename);
  const wstream = createWriteStream(path);
  if (stream) {
    await waitWritable(stream.pipe(wstream));
    return 'ok';
  } else {
    throw new ServiceError(400, 'http 请求体不存在上传内容!');
  }
};

/** 浏览器测试范例 */
function test() {
  const testUrl = 'http://localhost:8081/upload';
  const obj = { hello: 'uploaded content' };
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/octet' });

  fetch(testUrl, {
    method: 'post',
    mode: 'cors', // cors no-cors 都能在服务端接口请求流，但是浏览器都看不到 response 中内容，status 分别为 0 和 404
    body: blob,
  }).then(resp => {
    console.log(resp.ok, resp.status, resp);
  });
}
