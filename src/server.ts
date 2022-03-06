import { createServer, get } from 'http';
import { asyncLocalStorage } from 'src/lib/transaction';
import { ServiceError } from 'src/lib/registry';
import { createConnection } from "typeorm";
import { watchHotUpdate } from './hotUpdate';
import { URL } from 'url';

watchHotUpdate();

const PORT = 8081;

function startServer() {
  let idSeq = 0;
  createServer(async (req, res) => {
    console.log(`request ${idSeq + 1} coming...`);
    // 动态根据访问路径找到对应的处理 ts 文件
    const url = new URL(req.url, `http://${req.headers.host}`);
    const fassAsync = await import(`src/services${url.pathname}`);
    const start = fassAsync.faas;
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
        // @ts-ignore
        await Promise.all(Object.values(store.db).map(db => db.rollbackTransaction()));
        console.log('---------', e instanceof ServiceError, e);
        if (e instanceof ServiceError) {
          console.log('--------- catched');
          res.end(JSON.stringify({ code: e.code, msg: e.message }));
        } else {
          console.log('--------- not catched', e.code, e.message);
          res.end(JSON.stringify({ code: e.code, msg: e.message }));
          console.log('res.end with exception')
        }
      }
      // console.log(require.cache);
    });
  }).listen(PORT);
}


async function startAndTest() {
  await createConnection('postgis');
  startServer();
  // get(`http://localhost:${PORT}/testTransactionQueryRunner`);
  await new Promise((r) => setTimeout(r, 300));
  // get(`http://localhost:${PORT}/testTransactionQueryRunner`);
}

startAndTest();
