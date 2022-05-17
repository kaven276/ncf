import { reaction } from 'mobx';
import { types } from 'mobx-state-tree';
import { AsyncTrack } from 'clib/mobx/AsyncTrack';
import { OptionObject, IFormItemConfig } from './FormInterface';

type FormItemValueType = string | number | boolean;
// todo 缺 string[] 多选类型

/**
 * 根据普通配置，生成MST表单模型实例
 * - 对 cfg.options 等配置生成对应的 _xxx 计算值，根据配置是值还是函数分别判断计算值算法
 * - 在 afterCreate 中跟踪计算值的变化，再同步到属性值中，方便在 devtool 中查看
 * @param cfg
 * @returns
 */
export function createFormItem<T extends FormItemValueType>(cfg: IFormItemConfig<T>) {

  /** 创建一个 string 类型的表单项的属性 */
  function createPropString(prop: string) {
    return types.model({
      [prop]: types.maybe(types.string),
    }).views(self => {
      let fixed: string | undefined;
      let getter: (() => string) | undefined;
      if (Object.getOwnPropertyDescriptor(cfg, prop)) {
        const descriptor = Object.getOwnPropertyDescriptor(cfg, prop)!;
        if (descriptor.get) {
          getter = descriptor?.get!;
        } else {
          fixed = descriptor.value;
        }
      }
      return {
        get [`_${prop}`](): string {
          if (fixed) return fixed;
          if (getter) return getter.call(self);
          return '';
        },
      }
    }).actions(self => {
      return {
        afterCreate() {
          if (Object.getOwnPropertyDescriptor(cfg, prop)) {
            const set = self._set as unknown as (prop: string, v: string) => void;
            reaction(() => self[`_${prop}`], v => set(prop, v), { fireImmediately: true });
          }
        }
      }
    });
  }

  /** 创建一个 boolean 类型的表单项的属性 */
  function createPropBoolean(prop: string, defaultBoolValue: boolean) {
    return types.model({
      [prop]: types.optional(types.boolean, defaultBoolValue),
    }).views(self => {
      let fixed: boolean = defaultBoolValue;
      let getter: (() => boolean) | undefined;
      if (Object.getOwnPropertyDescriptor(cfg, prop)) {
        const descriptor = Object.getOwnPropertyDescriptor(cfg, prop)!;
        if (descriptor.get) {
          getter = descriptor?.get!;
        } else if (descriptor.value !== undefined) {
          fixed = descriptor.value;
        } else {
          fixed = defaultBoolValue;
        }
      }
      return {
        get [`_${prop}`](): boolean {
          if (getter) return getter.call(self);
          return fixed;
        },
      }
    }).actions(self => {
      return {
        afterCreate() {
          if (Object.getOwnPropertyDescriptor(cfg, prop)) {
            const set = self._set as unknown as (prop: string, v: boolean) => void;
            reaction(() => self[`_${prop}`], v => set(prop, v), { fireImmediately: true });
          }
        }
      }
    });
  }

  /** 表单项基本模型 */
  const FormItemModelBase = types.model({
    // value: types.frozen<T>(cfg.value),
    value: types.maybe(types.frozen<T>(cfg.value)),
    options: types.maybe(types.frozen<OptionObject[]>()),
    asOptions: types.maybe(AsyncTrack()),
    asCheck: types.maybe(AsyncTrack()),
    extra: types.frozen<any>({}),
  }).actions(self => {
    return {
      set(v: T) {
        if (cfg.set) {
          cfg.set.call(self, v);
        } else {
          self.value = v as T;
        }
      },
      _set(k: 'label' | 'options' | 'error' | 'prefix' | 'suffix' | 'extra', v: any) {
        //@ts-ignore
        self[k] = v;
      },
    }
  }).views(self => {
    // for options
    const descriptor = Object.getOwnPropertyDescriptor(cfg, 'options');
    if (descriptor && descriptor.get) {
      const getOptions = descriptor?.get!
      return {
        get _options(): OptionObject[] | undefined {
          return getOptions.call(self);
        },
      }
    }
    return {};
  }).actions(self => {
    return {
      afterCreate() {
        // 直接将表单项配置中的 AsyncTrack 挂到表单项 MST 中
        if (cfg.asOptions) {
          self.asOptions = cfg.asOptions;
        }
        if (cfg.asCheck) {
          self.asCheck = cfg.asCheck;
        }
        const options = Object.getOwnPropertyDescriptor(cfg, 'options');
        if (options) {
          if (options.get) {
            reaction(() => self._options, v => self._set('options', v), { fireImmediately: true });
          } else if (options.value) {
            self.options = options.value;
          }
        }
        if (cfg.setup) {
          cfg.setup.call(self);
        }
      },
    }
  });

  const s = createPropString;
  const b = createPropBoolean;
  const FormItemModel = types.compose(FormItemModelBase
    , types.compose(s('error'), s('label'), s('prefix'), s('suffix'), s('tip'), s('placeHolder'))
    , types.compose(b('visible', true), b('disabled', false), b('required', false), b('readonly', false))
  );
  //@ts-ignore
  return types.optional(FormItemModel, () => ({}));
}

/** todos
 * - multile values, and delta +-
 * - Date/Time
 * - AsyncTrack ts support
 * - a bounch of form items adapted to both mobx and MST
 * - a few of TS exception which is ignored to be solved finally
 */
