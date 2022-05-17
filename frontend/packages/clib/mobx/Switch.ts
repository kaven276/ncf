import { types } from 'mobx-state-tree';

/** 扩展 AsyncState，提供开关模型，方便一个表单模式框对应一个后台提交的场景。 */
const Switch_ = types.model({
  /** modalVisible 对应的表单是否显示，这样就可以节省 MST 状态字段定义 */
  v: false,
}).views(self => ({
  /** 开关是否处于开状态 */
  get on() {
    return self.v;
  },
  /** 开关是否处于关状态 */
  get off() {
    return !self.v;
  },
})).actions(self => ({
  /** 打开开关 */
  open() {
    self.v = true;
  },
  /** 关闭开关 */
  close() {
    self.v = false;
  },
  /** 切换开关 */
  toggle() {
    self.v = !self.v;
  },
  /** 按参数设定开关 */
  setTo(v: boolean) {
    self.v = v;
  },
}));

/** Switch 模型，默认关闭状态 */
export const Switch = (/** 默认开还是关，不写为关 */ v: boolean = false) => types.optional(Switch_, { v });
