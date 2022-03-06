import { createServer, get } from 'http';
import { asyncLocalStorage } from 'src/lib/transaction';
import { ServiceError } from 'src/lib/registry';
import { createConnection } from "typeorm";
import { watchHotUpdate, registerDep } from './hotUpdate';
import { URL } from 'url';

watchHotUpdate();

const PORT = 8081;

function startServer() {
  let idSeq = 0;
  createServer(async (req, res) => {
    console.log(`request ${idSeq + 1} coming...`);
    // 动态根据访问路径找到对应的处理 ts 文件
    const url = new URL(req.url, `http://${req.headers.host}`);
    const resolvedPath = require.resolve(`src/services${url.pathname}`);
    const fassAsync = await import(resolvedPath).catch(e => ({}));
    const start = fassAsync.faas;
    if (!start) {
      res.statusCode = 404;
      res.end();
      return;
    }
    registerDep(resolvedPath);

    // 反向登记依赖的 children，child 改变时，可以将依赖服务删除
    console.log(resolvedPath);

    const jwtString = req.headers['authorization'] || 'anonymous';

    asyncLocalStorage.run({ id: ++idSeq, db: {}, jwtString, jwt: { sub: url.search || 'testuser' } }, async () => {
      const store = asyncLocalStorage.getStore()!;
      try {
        const result = await start();
        if (store.db) {
          // @ts-ignore
          await Promise.all(Object.values(store.db).map(db => db.commitTransaction()));
        }
        res.end(JSON.stringify({ code: 0, data: result }));
        console.log('res.end successfully')
      } catch (e) {
        await Promise.all(Object.values(store.db).map(db => db.rollbackTransaction()));
        console.log('---------', e instanceof ServiceError, e);
        if (e instanceof ServiceError) {
          res.statusCode = 500;
          res.end(JSON.stringify({ code: e.code, msg: e.message }));
        } else {
          console.log('--------- not ServiceError', e.code, e.message);
          res.statusCode = 500;
          res.end(JSON.stringify({ code: e.code, msg: e.message }));
        }
      }
      // console.log(require.cache);
    });
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
