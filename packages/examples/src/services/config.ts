import { makeRe } from 'minimatch';
import { check401, checkIsAdmin } from '.';
import { MWContext } from '@ncf/engine';
import { logTimeUse } from '../middlewares/logTimeUse';
import { createRandomLatency } from '../middlewares/randomLatency';

const faasRegExp = makeRe('/faas2*');
export const middlewares = [
  (ctx: MWContext, next: any) => {
    console.log(`${ctx.path} is calling`);
    // console.log(path, faasRegExp.test(path));
    if (faasRegExp.test(ctx.path)) {
      check401();
      checkIsAdmin();
      // throw new ServiceError(403, '禁止访问 /faas*');
    }
    next();
  },
  logTimeUse,
  createRandomLatency({ maxLatencyMs: 2000 }),
]
