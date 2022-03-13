import { Client } from 'pg';

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  const client = new Client({
    user: 'echarts',
    host: "127.0.0.1",
    password: "echarts",
    port: 25432,
  });
  await client.connect()
  const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  console.log(res.rows[0].message) // Hello world!
  await client.end();
  return res.rows;
}
