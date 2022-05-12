import { innerCall, mapCall } from '@ncf/microkernel';
import { ISpec } from './findUsers.spec';
import tap from 'tap';

/** 如果是顶层模块，认为是要测试任务 */
export const task = (require.main === module) && tap.test('finedUsers', async (t) => {
  await Promise.all([
    innerCall<ISpec>('/typeorm/hr/findUsers', { onlyFirstName: 'Li' }).then(resp => {
      t.ok(resp.filter(user => !user.firstName.includes('Li')).length === 0, 'onlyFirstName 确保不返回不匹配的记录');
    }),
    innerCall<ISpec>('/typeorm/hr/findUsers', { showNames: true }).then(resp => {
      t.ok(resp.some(user => user.names), 'req.showNames 可以查到带 names 的 user 记录');
    }),
    t.resolves(innerCall<ISpec>('/typeorm/hr/findUsers', {}), '无参数调用能正常返回响应不抛异常'),
    // t.resolveMatchSnapshot(innerCall<ISpec>('/typeorm/hr/findUsers', {}), '无参数调用能正常返回相同内容');
  ]);
});

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
