// require('ts-node').register({ /* options */ });

import http from 'http';
import { AsyncLocalStorage } from 'async_hooks';

/** 服务调用期间的全部内容 */
interface ICallState {
  /** 调用号 */
  id: number,
  /** 调用中到第几步 */
  seq: number,
  /** 调用过程列表，执行过程中收集 */
  list: {
    /** 执行步骤调用序号 */
    seq: number,
    /** 执行发生时间 */
    time: InstanceType<typeof Date>,
    /** 消息 */
    msg?: string,
  }[],
}

const asyncLocalStorage = new AsyncLocalStorage<ICallState>();


function sub1() {
  const store = asyncLocalStorage.getStore()!;
  store.seq++;
  console.log(store.id, store.seq, `sub1`);
  setTimeout(() => sub2(), 1000);
}

async function sub2() {
  const store = asyncLocalStorage.getStore()!;
  store.seq++;
  console.log(store.id, store.seq, `sub2`);
  return 123;
}

function logWithId(msg: string) {
  const store = asyncLocalStorage.getStore()!;
  store.seq++;
  store.list.push({ seq: store.seq, time: new Date(), msg })
  console.log(store.id, store.seq, msg);

  if (msg === 'finish') {
    sub1();
    sub2();
    console.log(store);
  }
}

let idSeq = 0;
http.createServer((req, res) => {
  const result = asyncLocalStorage.run({ id: idSeq++, seq: 0, list: [] }, (args) => {
    console.log('args', args);
    // console.log(asyncLocalStorage.getStore())
    logWithId('start');
    // Imagine any chain of async operations here
    setImmediate(() => {
      logWithId('finish');
      res.end();
    });
    return 123;
  }, 2);
  console.log('result', result);
}).listen(8080);

http.get('http://localhost:8080');
setTimeout(() => http.get('http://localhost:8080'), 2000);
// http.get('http://localhost:8080');
// Prints:
//   0: start
//   1: start
//   0: finish
//   1: finish


//@ts-ignore
import tx2 from 'tx2';

tx2.action('test', (reply: any) => {
  http.get('http://localhost:8080');
  reply({ answer: 'access self' })
})
