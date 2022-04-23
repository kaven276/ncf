import { createReadStream } from 'node:fs';
import { normalize } from 'node:path';
import { getCallState } from '../executor';
import { throwServiceError } from './ServiceError';
import { ProjectDir, MoundDir } from '../util/resolve';
import { GwExtras } from './gateway';

export function getFaasTsSpec(faasPath: string, gw: GwExtras) {
  const ctx = getCallState();
  if (gw.gwtype !== 'http' && gw.gwtype !== 'koa') {
    return throwServiceError(1, '只能通过 http 协议访问');
  }
  const res = gw.http.res;
  res.setHeader('content-type', 'application/x-typescript');
  const filename = normalize(`${ProjectDir}/${MoundDir}/faas${faasPath}.spec.ts`);
  try {
    const s = createReadStream(filename);
    return s;
  } catch (e) {
    throwServiceError(2, `faas ${faasPath} have no  typecript specification file associated`);
  }
}
