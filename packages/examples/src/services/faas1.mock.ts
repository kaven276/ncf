import { add } from './util1';
import { PI, check401, checkIsAdmin } from '.';
import { Service } from '@ncf/engine';
import { ISpec } from './faas1.spec';

export const faas: Service<ISpec> = async (req) => {
  check401();
  checkIsAdmin();
  return {
    'name': 'test1mock',
    count: add(10),
    PI,
  }
};

