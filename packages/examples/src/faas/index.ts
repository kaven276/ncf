import { getCaller } from '@ncf/microkernel';
import { cfgSecret, ctxJWT, ctxJWTStruct, cfgJwtOption } from '@ncf/mw-jwt';
import { cfgLatency } from 'src/mw/randomLatency';
import { throwServiceError } from '@ncf/microkernel';

export const config = {
  ...cfgSecret.set('ncf is best'),
  ...cfgJwtOption.set({
    issuer: 'kaven276',
    subject: 'ncf example',
  }),
  ...cfgLatency.set({
    maxLatencyMs: 0,
  }),
}

export const PI = 3.1415926;

export function check401() {
  if (!getCaller().user) {
    throwServiceError(401, '未认证');
  }
}

export function checkIsAdmin() {
  console.log('checkIsAdmin', ctxJWTStruct.get());
  console.log('getJWT', ctxJWT.get());
  // todo: threadStore.jwt?.sub 报异常 error TS1109: Expression expected.
  if (getCaller().user !== 'admin') {
    throwServiceError(403, '不是管理员')
  }
}
