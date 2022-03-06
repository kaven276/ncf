import { createServer, get } from 'http';
import { asyncLocalStorage } from 'src/lib/transaction';
import { service } from 'src/services/testTransactionQueryRunner';
import { createConnection } from "typeorm";

const PORT = 8081;
function startServer() {
  let idSeq = 0;
  createServer((req, res) => {
    const start = service;
    asyncLocalStorage.run({ id: ++idSeq, db: {} }, async () => {
      const result = await start();
      const store = asyncLocalStorage.getStore()!;
      if (store.db) {
        // @ts-ignore
        await Promise.all(Object.values(store.db).map(db => db.commitTransaction()));
      }
      res.end(JSON.stringify(result));
    });
  }).listen(PORT);
}


createConnection('postgis').then(() => {
  startServer();
  get(`http://localhost:${PORT}`);
  // setTimeout(() => get(`http://localhost:${PORT}`), 2000);
});
