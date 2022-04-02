import pool from 'src/bass/pg/pg1';

interface IResult {
  /** 当前数据库时间 */
  now: string,
}

/** 直接 import pg baas 模块拿到 pool 使用的范例 */
export const faas = async () => {
  const res = await pool.query<IResult>('SELECT user, NOW()');
  return res.rows[0];
}
