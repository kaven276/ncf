import { TAsyncTrack } from 'clib/mobx/AsyncTrack'

type OptionString = string;
type OptionTuple = [string, string, boolean?];
export type OptionObject = { label: string, value: string | number, disabled?: boolean };
type Option = OptionString | OptionTuple | OptionObject;

function isOptionString(option: Option): option is OptionString {
  return typeof option === 'string';
}

function isOptionTuple(option: Option): option is OptionTuple {
  return Array.isArray(option);
}

function isOptionObject(option: Option): option is OptionObject {
  const opt = option as OptionObject;
  return typeof opt === 'object' && !!opt.label && !!opt.value;
}

export function stringsToOptions(s: string[]): OptionObject[] {
  return s.map(v => ({ label: v, value: v }));
}

export function tuplesToOptions(s: OptionTuple[]): OptionObject[] {
  return s.map(v => ({ label: v[1], value: v[0], disabled: v[2] }));
}

export type FormItemValue = string | number | boolean | string[] | undefined;

/**
 * MST FORM 的核心
 * model 配置和配置结果符合此接口规范
 * 表单渲染封装接受此规格的参数
 * autobind 自动绑定其中的 value/set
 */
export interface IFormItemConfig<T extends FormItemValue> {
  labelId?: string,
  /** 配置时的值，用于比较是否变化和reset恢复初始值抛弃变更 */
  initialValue?: T,
  value: T,
  set?: (v: T) => void,
  label: string,
  prefix?: string,
  suffix?: string,
  tip?: string,
  placeHolder?: string,
  readonly?: boolean,
  disabled?: boolean,
  visible?: boolean,
  required?: boolean,
  /** 空值告警提示 */
  emptyWarn?: string,
  /** async/api check throttle (ms) */
  checkDelay?: number,
  readonly check?: (value: T) => string | undefined | Promise<string | undefined>,
  /** fetch options list throttle (ms) */
  fetchDelay?: number,
  readonly fetch?: () => Promise<OptionObject[]>,
  readonly options?: OptionObject[],
  /** 表单项模型创建最后一步执行，常用来各类订阅(不限于mobx observable)，
   * 参数 addDisposer 在模型销毁时来执行取消订阅的函数。  */
  readonly setup?: (addDisposer: (disposer: Function) => void) => void,
  asOptions?: TAsyncTrack,
  asCheck?: TAsyncTrack,
  extra?: any,
}

export type IFormItemModel<T extends FormItemValue> = Omit<IFormItemConfig<T>, 'set'> & {
  // set -?: FormItemConfig<T>["set"], // ts 不支持
  set: (v: T) => void,
  /** 表单项初始值或者原来的值，用于 reset 恢复，对数组情形也用于比较新增和删除的选项的基础参考列表用 */
  defaultValue?: T,
  /** 恢复表单项初始值 */
  readonly reset: () => void,
  /** 是否改做出过改变，即使最后改回原来的值 */
  readonly dirty: boolean,
  /** 是否最终改变了初始设置的值 */
  readonly changed: boolean,
  /** 不改动当前值，但是立即触发一次校验过程 */
  readonly touch: () => void,
  /** 校验出的错误，有为错误字符串，无为 undefined */
  readonly error: string | undefined,
  /** 是否正在异步校验，实际配置必须是 getter 计算值 */
  checking: boolean,
  /** 是否正在获取选项清单，实际配置必须是 getter 计算值 */
  fetching: boolean,
  /** 聚焦的次数 */
  focusCount: number,
  /** 离开聚焦的次数 */
  blurCount: number,
  /** 表单项是否正在聚焦 */
  readonly focusing: boolean,
  /** focus 事件中调用计数 focusCount */
  onFocus: () => void,
  /** blue 事件中调用计数 blurCount */
  onBlur: () => void,
  /** 自动查得多值中增加的条目清单 */
  plusItems?: string[],
  /** 自动查得多值中减少的条目清单 */
  minusItems?: string[],
}
