import { createServer, get } from 'http';
import { execute } from './executor';
import { createConnection } from "typeorm";

import { URL } from 'url';

const PORT = 8081;

function startServer() {

  createServer(async (req, res) => {
    // 动态根据访问路径找到对应的处理 ts 文件
    const url = new URL(req.url, `http://${req.headers.host}`);
    const faasPath = url.pathname;
    const jwtString = req.headers['authorization'] || 'anonymous';
    const sub = url.search || 'testuser';

    // 给核心服务环境信息，然后调用
    const result = await execute({ jwtString, sub, faasPath });
    res.statusCode = result.status || 200;
    res.end(JSON.stringify(result));
  }).listen(PORT);
}


async function startAndTest() {
  await createConnection('postgis');
  startServer();
  get(`http://localhost:${PORT}/testTransactionQueryRunner`);
  await new Promise((r) => setTimeout(r, 300));
  // get(`http://localhost:${PORT}/testTransactionQueryRunner`);
}

startAndTest();
