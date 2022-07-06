import { Files, Fields, formidable } from 'formidable';
import { getCallState } from '@ncf/microkernel';
import { join } from 'node:path';

/** 获取的 multipart 上传文件信息 */
export interface MultiPartResult {
  files?: Files,
  fields?: Fields,
}

export async function getMultiParts(): Promise<MultiPartResult> {
  const ctx = getCallState();
  return new Promise((resolve) => {
    if (ctx.gw.gwtype !== 'koa') {
      resolve({});
    } else {
      console.log('start form multipart parse');
      const form = formidable({
        multiples: false,
        uploadDir: join(process.cwd(), 'upload'),
      });
      form.parse(ctx.gw.http.req, (err, fields, files) => {
        console.log('form.parse ok', fields, files);
        if (err) {
          resolve({});
        } else {
          resolve({ fields, files })
        }
      });
      form.on('progress', (bytesReceived, bytesExpected) => {
        console.log('progress', bytesReceived, bytesExpected);
      });
    }
  });
}
