import { getPGPoolByServiceThread } from 'src/baas/testPgPool';

interface IResult {
  /** 当前数据库时间 */
  message: string,
}

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  const client = await getPGPoolByServiceThread('test');
  const res = await client.query<IResult>('SELECT $1::text as message', ['Hello world!'])
  return res.rows[0];
}
