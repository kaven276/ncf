import { add } from './util1';
import { PI } from '.';

export function faas() {
  return {
    'name': 'test1',
    count: add(10),
    PI,
  }
}

