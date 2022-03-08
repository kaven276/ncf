// const nf = require('node-fetch/src/');
const { createReadStream } = require('fs');
const PORT = 8081;

async function test() {
  const fetchModule = await import('node-fetch');
  const fetch = fetchModule.default;
  fetch(`http://localhost:${PORT}/faas1?user=admin`, {
    method: 'post',
    body: createReadStream(__filename),
  }).then((resp) => resp.json())
    .then(console.log);
}

test();
