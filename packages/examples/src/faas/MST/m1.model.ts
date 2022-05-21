import { types, Instance, getEnv } from 'mobx-state-tree';

/** 被另外一个模型引用的模型 */
const ReferedModel = types.model('refered', {
  product: 'macbook',
  count: 0,
}).actions(self => {
  return {
    buyMore() {
      self.count += 1;
    }
  }
});


/** 当前模型 */
const Model = types.model('model', {
  name: 'Apple',
  price: 0,
}).volatile(self => ({
  refModel: getEnv(self).refModel as Instance<typeof ReferedModel>,
})).extend(self => {
  let count = 0;
  return {
    views: {
      get count() {
        return count;
      }
    },
    actions: {
      increase() {
        count += 1;
        self.price += 1;
        self.refModel.buyMore();
      },
      decrease() {
        count -= 1;
        self.price -= 1;
      },
    },
    state: {
      age: 123,
    }
  }
}).actions(self => {
  return {
    grow() {
      self.age += 1;
    }
  }
});

export const m = Model.create({}, {
  refModel: ReferedModel.create()
});
