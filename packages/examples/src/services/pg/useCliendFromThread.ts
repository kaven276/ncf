import { getPGPoolByServiceThread } from 'src/baas/testPgPool';
import { faas as sub } from './useCliendFromThreadSub';
import { getDebug, throwServiceError } from '@ncf/engine';

const debug = getDebug(module);

interface IResult {
  /** 当前数据库时间 */
  now: string,
}

/** 测试直接使用 pg 单个连接提供服务 */
export async function faas() {
  const client = await getPGPoolByServiceThread('test');
  const res = await client.query<IResult>('SELECT  NOW()');
  const resSub = await sub();
  if (Math.random() < 0.5) {
    throwServiceError(500, '事务处理中发生异常，需要回退');
  }
  debug('will return');
  return {
    now: res.rows[0].now,
    sub: resSub,
  };
}
