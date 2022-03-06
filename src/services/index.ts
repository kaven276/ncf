import { getConnFromThread } from 'src/lib/transaction';
import { asyncLocalStorage } from 'src/lib/transaction';
import { ServiceError } from 'src/lib/ServiceError';
import { makeRe } from 'minimatch';

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
  if (threadStore.jwt.sub !== 'admin') {
    throw new ServiceError(403, '不是管理员')
  }
}

const faasRegExp = makeRe('/faas*');
export const middlewares = [
  (path: string) => {
    // console.log(path, faasRegExp.test(path));
    if (faasRegExp.test(path)) {
      check401();
      checkIsAdmin();;
      // throw new ServiceError(403, '禁止访问 /faas*');
    }
  }
]
