const { Client } = require('pg')

/*
env|grep PG
PGDATABASE=echarts
PGHOST=127.0.0.1
PGPORT=25432
PGUSER=echarts
PGPASS=echarts
*/

async function test() {
  console.log(1);
  const client = new Client({
    host: '127.0.0.1',
    port: 25432,
    user: 'echarts',
    database: 'echarts',
    password: 'echarts',
    connectionTimeoutMillis: 1000,
  })
  console.log(2);
  await client.connect().catch((e) => console.error(e));
  console.log(3);
  const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  console.log(res.rows[0].message) // Hello world!
  await client.end();
  console.log(9)
}

test().then(() => {
  console.log('ok');
}).catch(() => {
  console.error('error')
});
