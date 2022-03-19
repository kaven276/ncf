import { IncomingMessage, RequestListener } from 'http';
import { URL } from 'url';
import { execute } from './executor';

export const httpGateway: RequestListener = async (req, res) => {
  // 动态根据访问路径找到对应的处理 ts 文件
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const isPost = req.method!.toUpperCase() === 'POST';
  const faasPath = url.pathname;
  const mock = !!url.searchParams.get('mock');
  // const request = {...new Map(url.searchParams)};
  const request = {} as any;
  url.searchParams.forEach((value, name) => {
    request[name] = value;
  });

  let stream: IncomingMessage | undefined;
  if (isPost) {
    stream = req;
    // console.log('found stream');
  }

  // 给核心服务环境信息，然后调用
  try {
    const result = await execute({ faasPath, request, stream, mock, http: { req, res } });
    res.statusCode = result.status || 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (e) {
    res.statusCode = 500;
    res.end();
  }
};
