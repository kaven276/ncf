import { getPGPoolByServiceThread } from 'src/baas/testPgPool';
import { getDebug } from '@ncf/engine';

const debug = getDebug(module);

interface IResult {
  /** 当前数据库时间 */
  message: string,
}

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  debug('enter');
  const client = await getPGPoolByServiceThread();
  const res = await client.query<IResult>('SELECT $1::text as message', ['Hello world!']);
  const resAge = await client.query('update user2 set age=age + $1 where "firstName"=$2 RETURNING "age"', [Math.floor(Math.random() * 10) - 5, 'LiYong']);
  debug('will return', resAge.rows);
  return { ...res.rows[0], ...resAge.rows[0] };
}
