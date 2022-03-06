import { add } from './util1';
import { PI, check401, checkIsAdmin } from '.';

export async function faas() {
  check401();
  checkIsAdmin();
  return {
    'name': 'test1',
    count: add(10),
    PI,
  }
}

