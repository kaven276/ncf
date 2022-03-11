
const PORT = 8081;

export async function test() {
  // const fetchModule = await import('node-fetch');
  // const fetch = fetchModule.default;
  // get(`http://localhost:${PORT}/testTransactionQueryRunner`);
  fetch(`http://localhost:${PORT}/upload`, {
    method: 'post',
    headers: {
      // 'content-type': 'application/json',
    },
    body: JSON.stringify({ user: 'admin' })
    // body: createReadStream(__filename),
  }).then(resp => {
    console.log('fetch result', resp.headers.get('content-type1'));
    return resp.json()
  }).then(console.log);
  await new Promise((r) => setTimeout(r, 300));
  // get(`http://localhost:${PORT}/testTransactionQueryRunner`);
}

test();
