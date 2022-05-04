// 调用 api
import { request } from 'node:http';

const debug = console.log;

/** task 执行的 ncf server 地址，如 1.2.4.8:8080 */
const [hostname = '127.0.0.1', port = 8000] = (process.env.NCF_HOST ?? '127.0.0.1:8000').split(':')

/** 延迟任务 API 调用 */
export async function callApi(path: string, req: any): Promise<unknown> {
  const content = req ? Buffer.from(JSON.stringify(req), 'utf8') : undefined;
  // debug(`call ${path} : ${JSON.stringify(req)}`);
  return new Promise((resolve, reject) => {
    if (Math.random() < 0.3) {
      return reject();
    }

    const req = request({
      method: 'POST',
      hostname,
      port,
      path,
      headers: {
        'content-type': 'application/json',
        'user-agent': '@ncf/ext-later-rocksdb',
        'content-length': String(content ? content.length : 0),
      },
    });
    req.end(content);
    req.once('response', (resp) => {
      const statusCode = resp.statusCode ?? 200;
      if (statusCode >= 200 && statusCode < 300) {
        resolve(resp.statusCode);
      } else {
        reject(resp.statusCode);
      }
    });
    req.on('error', (e) => {
      console.error(`call ${path} failed`, req, e)
      reject();
    });
  });
}

