import { AsyncLocalStorage } from 'async_hooks';
import { QueryRunner, getConnection } from "typeorm";

/** 服务调用期间的全部内容 */
export interface ICallState {
  /** 调用号 */
  id: number,
  db: {
    [name: string]: QueryRunner,
  },
  jwtString?: string,
  jwt?: {
    sub: string,
  },
}

export const asyncLocalStorage = new AsyncLocalStorage<ICallState>();

/** service thread 中需要获取执行名称的链接并开启事务的时候调用 */
export async function getConnFromThread(name: string) {
  const store = asyncLocalStorage.getStore()!;
  if (store.db && store.db[name]) {
    return store.db[name];
  }
  const c = getConnection(name);
  const queryRunner = c.createQueryRunner();
  await queryRunner.startTransaction("READ COMMITTED");
  store.db[name] = queryRunner;
  return queryRunner;
}
