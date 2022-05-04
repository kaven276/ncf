import { serverPromise } from '../src/index';
import { request } from 'node:http';
import type { LaterTaskTuple } from '../src/spec';

function random(base: number, range: number) {
  return Math.round(Math.random() * range * 1000 + base * 1000);
}

const now = Date.now();
const demoTasks: LaterTaskTuple[] = [
  ['/dir1/path1', { p1: 1 }, now],
  ['/dir2/path2', { p2: 2 }, now + random(2, 10)],
  ['/dir3/path3', { p3: 3 }, now + random(4, 10)],
  ['/dir4/path4', { p4: 4 }, now + random(6, 10)],
];

serverPromise.then(async (port) => {
  const req = request({
    method: 'POST',
    hostname: '127.0.0.1',
    port,
    headers: {
      'content-type': 'application/json',
      'x-later': '1',
    },
  });
  req.end(JSON.stringify(demoTasks));
  req.once('response', (resp) => {
    // console.dir(resp);
    console.log(resp.statusCode, resp.headers);
  })
});
