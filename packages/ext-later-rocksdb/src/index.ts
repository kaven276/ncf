import 'dotenv/config';
import { createKoaApp } from './server';
import { createServer } from 'node:http';
import { start, stop } from './executor';

start();
process.once('SIGHUP', stop);

const app = createKoaApp().callback();
export const port = Number(process.env.PORT || 7999);

/** 监听启用成功后 promise resolve 到监听端口数字 */
export const serverPromise = new Promise<number>(resolve => {
  const server = createServer(app).listen(port, () => {
    console.info(`later server is listening at ${port}`);
    resolve(port);
  });
  process.once('SIGHUP', () => {
    server.close();
  });
});
