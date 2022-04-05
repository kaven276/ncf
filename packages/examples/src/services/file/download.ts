import { resolve } from 'path';
import { createReadStream } from 'node:fs';
import { getCallState, ProjectDir } from '@ncf/microkernel';

interface IRequest {
  filename: string,
}

/** 文件下载范例
 * @see http://localhost:8081/file/download?filename=/1648989704675/OCP8i.jpeg
 */
export const faas = async (req: IRequest) => {
  const res = getCallState().http.res;
  const downloadFileName = req.filename.split('/').pop();
  res.setHeader('Content-Disposition', `inline; filename="${downloadFileName}"`);
  res.setHeader('content-type', 'image/jpeg');
  const filename = resolve(ProjectDir, 'upload', req.filename);
  const s = createReadStream(filename);
  return s;
};
