import { Pool } from 'pg';
import { getDebug } from '@ncf/microkernel';

const debug = getDebug(module);

const pool = new Pool({
  user: 'echarts',
  host: "127.0.0.1",
  password: "echarts",
  port: 25432,
})

interface IResult {
  /** 当前数据库时间 */
  now: string,
}
/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  const res = await pool.query<IResult>('SELECT  NOW()');
  return res.rows[0].now;
}
