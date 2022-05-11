import { innerCall } from '@ncf/microkernel';
import { ISpec } from './findUsers.spec';
import tap from 'tap';

const tests = [
  () => innerCall<ISpec>('/typeorm/hr/findUsers', { onlyFirstName: 'Li' }),
  () => innerCall<ISpec>('/typeorm/hr/findUsers', { onlyFirstName: 'Timber', showNames: false }),
  () => innerCall<ISpec>('/typeorm/hr/findUsers', {
    sex: 'male',
    showNames: true,
    onlyFirstName: 'LiYong',
  }),
];

export const faas = async () => {
  return Promise.all(tests.map(fn => fn()));
}

// below is tap test
if (require.main === module) {
  tap.test('finedUsers', async (t) => {
    const result = await innerCall<ISpec>('/typeorm/hr/findUsers', { onlyFirstName: 'Li' });
    t.equal(result.length, 1);
    // return target({ showNames: true });
  });

  tap.test('finedUsers2', async (t) => {
    const result = await innerCall<ISpec>('/typeorm/hr/findUsers', { onlyFirstName: 'Li' });
    t.equal(result[0].age, 46);
    // return target({ showNames: true });
  });
}
