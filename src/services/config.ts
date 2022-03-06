import { makeRe } from 'minimatch';
import { check401, checkIsAdmin } from '.';

const faasRegExp = makeRe('/faas*');
export const middlewares = [
  (path: string) => {
    // console.log(path, faasRegExp.test(path));
    if (faasRegExp.test(path)) {
      check401();
      checkIsAdmin();
      // throw new ServiceError(403, '禁止访问 /faas*');
    }
  }
]
