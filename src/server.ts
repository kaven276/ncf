import { createServer, get } from 'http';
import { asyncLocalStorage } from 'src/lib/transaction';
import { ServiceError } from 'src/lib/registry';
import { service } from 'src/services/testTransactionQueryRunner';
import { createConnection } from "typeorm";


const PORT = 8081;
function startServer() {
  let idSeq = 0;
  createServer((req, res) => {
    console.log(`request ${idSeq + 1} coming...`);
    const start = service;
    asyncLocalStorage.run({ id: ++idSeq, db: {} }, async () => {
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
    });
  }).listen(PORT);
}


createConnection('postgis').then(() => {
  startServer();
  get(`http://localhost:${PORT}`);
  setTimeout(() => get(`http://localhost:${PORT}`), 300);
});
