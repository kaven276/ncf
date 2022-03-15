import { throwServiceError } from '@ncf/engine';
import { getConnFromThread } from '@ncf/baas-typeorm';
import { getJWT, getJWTStruct } from '../middlewares/mw-jwt';

export async function getManager() {
  const queryRunner = await getConnFromThread('postgis');
  const manager = queryRunner.manager;
  return manager;
}

export const PI = 3.1415926;

export function check401() {
  if (!getJWT()) {
    throwServiceError(401, '未认证');
  }
}

export function checkIsAdmin() {
  console.log('checkIsAdmin', getJWTStruct());
  // todo: threadStore.jwt?.sub 报异常 error TS1109: Expression expected.
  if (getJWTStruct() && getJWTStruct()!.sub !== 'admin')
    throwServiceError(403, '不是管理员')
}


