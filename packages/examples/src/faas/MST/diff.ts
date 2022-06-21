// 比较两个模型实例数据差异，产生 patch 数据
// 可以参照对比以下场景
// 1. 电信运营商做业务变更，根据 diff 指导发出哪些指令，如到网关的电子操作单
// 2. k8s 对象描述，根据变更调用控制器工作，如增加副本数，滚动升级
// 3. react diff 算法，产生 patch 用于 ReactDOM 更新 dom 的指令

import { types, onPatch, applySnapshot, getSnapshot, IJsonPatch } from 'mobx-state-tree';

const Model = types.model('StateForDiff', {
  id: 0,
  list: types.map(types.model({
    svcId: types.identifier,
    amount: 0,
  })),
  price: types.maybe(types.number),
})

const from = Model.create({
  id: 1,
  list: {
    svc1: {
      svcId: 'svc1',
      amount: 10,
    },
    svc2: {
      svcId: 'svc2',
      amount: 10,
    }
  },
});

const to = Model.create({
  id: 1,
  list: {
    svc1: {
      svcId: 'svc1',
      amount: 10, // 增加
    },
    // svc2 删除了，并添加了 svc3
    svc3: {
      svcId: 'svc3',
      amount: 10,
    }
  },
  price: 100,
});

export const faas = async () => {
  let c = 0;
  const patches: IJsonPatch[] = [];
  return new Promise((resolve, reject) => {
    const disposer = onPatch(from, (patch, reversed) => {
      console.log(++c, patch, getSnapshot(to), getSnapshot(from));
      if (patch.op === 'replace') {
        // 如果是变更，也记录下原来的值；原来没值的话，设定为 null 更显式
        //@ts-ignore
        patch.oldValue = reversed.value ?? null;
      }
      patches.push(patch);
    });
    applySnapshot(from, getSnapshot(to));
    setImmediate(() => {
      resolve(patches);
      disposer();
    })
  });
}
