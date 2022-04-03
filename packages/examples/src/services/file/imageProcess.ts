import { IncomingMessage } from 'http';
import sharp from 'sharp';
import { getCallState } from '@ncf/microkernel';

// [Node.js 服务端图片处理利器——sharp 进阶操作指南](https://cloud.tencent.com/developer/article/1418083)

/** 将上传图片做转换再下载，标准化尺寸并转成 png 格式，模拟一个在线图片处理服务 */
export const faas = async (req: any, stream: IncomingMessage) => {
  const res = getCallState().http.res;
  const filename = req.filename || String(Date.now());
  console.log('stream', !!stream, filename);
  const transformer = sharp().rotate(10).resize(400, 300).png();
  res.setHeader('Content-Disposition', `inline;`);
  res.setHeader('content-type', 'image/png');
  return stream.pipe(transformer);
};
