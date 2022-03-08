import { IncomingMessage } from 'http';
import { createWriteStream } from 'fs';
import { ServiceError } from 'src/lib/ServiceError';
import { join } from 'path';

export const faas = async (req: undefined, stream: IncomingMessage) => {
  console.log('stream', !!stream);
  const path: string = join(__dirname, '../../upload', String(Date.now()));
  const wstream = createWriteStream(path, { encoding: 'utf8' });
  if (stream) {
    stream.pipe(wstream);
    await new Promise((resolve) => {
      stream.on('end', resolve);
    });
    return 'ok';
  } else {
    throw new ServiceError(400, 'http 请求体不存在上传内容!');
  }
};
