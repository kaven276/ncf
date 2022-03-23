import { getPGPool } from 'src/baas/testPgPool';

interface IResult {
  /** 当前数据库时间 */
  now: string,
}
/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  const pool = getPGPool('pgsqlib');
  const res = await pool.query<IResult>('SELECT user, NOW()');
  return res.rows[0];
}
