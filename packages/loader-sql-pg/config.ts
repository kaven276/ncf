import type { Client, Pool } from 'pg';

export const configKey = Symbol('PgConnection');

/** 设置获取 pg client/pool 的函数，能执行其中 .query 即可。 */
export function setHowToGetPgConnection(getConnection: () => Client | Pool) {
  return {
    [configKey!]: getConnection
  }
}
