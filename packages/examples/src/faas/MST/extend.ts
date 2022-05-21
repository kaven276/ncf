import { getSnapshot } from 'mobx-state-tree';
import { m } from './m1.model';

export const faas = async () => {
  m.increase();
  m.grow();
  return {
    snapshot: getSnapshot(m),
    volitile: getSnapshot(m.refModel),
    age: m.age
  };
}
