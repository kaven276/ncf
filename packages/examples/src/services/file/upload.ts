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
  const path: string = join(__dirname, '../../../upload', filename);
  const wstream = createWriteStream(path);
  if (stream) {
    await waitWritable(stream.pipe(wstream));
    return 'ok';
  } else {
    throw new ServiceError(400, 'http 请求体不存在上传内容!');
  }
};

