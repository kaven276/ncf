import { join } from 'path';
import { createReadStream } from 'node:fs';
import { getCallState, ProjectDir, throwServiceError } from '@ncf/microkernel';

interface IRequest {
  filename: string,
}

/** 文件下载范例
 * @see http://localhost:8081/file/download?filename=/1648989704675/OCP8i.jpeg
 */
export const faas = async (req: IRequest) => {
  const ctx = getCallState();
  if (ctx.gw.gwtype !== 'http' && ctx.gw.gwtype !== 'koa') {
    return throwServiceError(1, '只能通过 http 协议访问');
  }
  const res = ctx.gw.http.res;
  const downloadFileName = encodeURIComponent(req.filename.split('/').pop()!);
  res.setHeader('Content-Disposition', `inline; filename="${downloadFileName}"`);
  res.setHeader('content-type', 'image/jpeg');
  const filename = join(ProjectDir, 'upload', req.filename);
  const s = createReadStream(filename);
  return s;
};
