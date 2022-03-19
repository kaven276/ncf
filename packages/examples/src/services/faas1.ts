import { add } from './util1';
import { PI, check401, checkIsAdmin } from '.';
import { Service, getDebug } from '@ncf/microkernel';
import { ISpec } from './faas1.spec';

export * from './faas1.check';

const { children, "exports": ex, paths, ...m } = module;

const debug = getDebug(module);
debug(m);

export const faas: Service<ISpec> = async (req) => {
  check401();
  // checkIsAdmin();
  const { children, exports, paths, ...m } = module;
  debug(m);
  return {
    'name': 'test1',
    count: add(10),
    PI,
    req,
    // a: 1, // additionalProperty will cause ajv check error
    module: m,
  }
};

