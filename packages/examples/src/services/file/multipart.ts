import { throwServiceError } from '@ncf/microkernel';
import { join } from 'node:path';
import { mkdir, rename } from 'node:fs/promises';
import { File } from 'formidable';

interface IRequest {
  a: number,
  b: number,
  files: {
    [fieldname: string]: File,
  },
}

/** 接受 multipart 文件上传范例，@ncf/gateway-koa 已经帮助将上传文件打入 req.files map 中 */
export const faas = async (req: IRequest) => {
  /** 上传文件在文件系统的路径 */
  // const callState = getCallState();
  // console.dir(callState.http.req.headers);
  const now = Date.now();
  const dirname = join(__dirname, '../../../upload', String(now));
  await mkdir(dirname);
  if (!req.files) {
    throwServiceError(1, '没有文件上传');
  }
  for (const [fieldname, file] of Object.entries(req.files)) {
    await rename(file.path, dirname + '/' + file.name);
  }
  return { ...req, files: Object.keys(req.files) };
};
