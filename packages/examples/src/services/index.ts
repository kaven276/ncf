import { asyncLocalStorage, ServiceError } from '@ncf/engine';
import { getConnFromThread } from '../baas/testOrmPool';

export async function getManager() {
  const queryRunner = await getConnFromThread('postgis');
  const manager = queryRunner.manager;
  return manager;
}

export const PI = 3.1415926;

export function check401() {
  const threadStore = asyncLocalStorage.getStore()!;
  if (!threadStore.jwt) {
    throw new ServiceError(401, '未认证');
  }
}

export function checkIsAdmin() {
  const threadStore = asyncLocalStorage.getStore()!;
  // todo: threadStore.jwt?.sub 报异常 error TS1109: Expression expected.
  if (threadStore.jwt && threadStore.jwt.sub !== 'admin') {
    throw new ServiceError(403, '不是管理员')
  }
}


