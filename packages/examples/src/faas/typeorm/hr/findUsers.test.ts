import { innerCall, mapCall } from '@ncf/microkernel';
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

/** 自己处理多个测试调用范例 */
export const faas1 = async () => {
  return Promise.all(tests.map(fn => fn()));
}

/** 直接使用 mapCall 执行多个命名调用测试，使用各自的请求参数 */
export const faas = async () => {
  return mapCall<ISpec>('/typeorm/hr/findUsers', {
    test1: {
      onlyFirstName: 'Li'
    },
    _test2: {
      onlyFirstName: 'Timber',
      showNames: false
    },
    test3: {
      sex: 'male',
      showNames: true,
      onlyFirstName: 'LiYong',
    }
  })
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
