import { add } from './util1';
import { PI, check401, checkIsAdmin } from '.';
import { Service } from 'src/lib/faas';

export interface ISpec {
  path: '/faas1',
  request: {
    user?: string,
  },
  response: {
    name: string,
    count: number,
    PI: number,
  }
}

export const faas: Service<ISpec> = async (req) => {
  check401();
  checkIsAdmin();
  return {
    'name': 'test1',
    count: add(10),
    PI,
  }
};

