import { throwServiceError, ProjectDir } from '@ncf/microkernel';
import { join } from 'node:path';
import { mkdir, rename } from 'node:fs/promises';
import { getMultiParts } from 'src/util/multipart';

/** 接受 multipart 文件上传范例，自行上传处理，网关不处理 */
export const faas = async () => {
  const now = Date.now();
  const dirname = join(ProjectDir, 'upload', String(now));
  await mkdir(dirname);
  // 可以在这里判断是否要接受上传，不接受可以直接返回响应
  const req = await getMultiParts();
  if (!req.files) {
    throwServiceError(1, '没有文件上传');
  }
  // console.log('req.files', req.files);
  for (const [fieldname, file] of Object.entries(req.files)) {
    console.log(1, fieldname, file.filepath, file.originalFilename);
    if (Array.isArray(file)) break; // 先不管同名文件上传多个的场景
    await rename(file.filepath, join(dirname, file.originalFilename ?? fieldname));
  }
  return { ...req, files: Object.keys(req.files) };
};
