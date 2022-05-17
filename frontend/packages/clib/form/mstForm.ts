import { reaction, runInAction, when } from 'mobx';
import { types, addDisposer, IAnyStateTreeNode, walk, getType, getPathParts, flow, getPath } from 'mobx-state-tree';
import { AsyncTrack } from 'clib/mobx/AsyncTrack';
import { OptionObject, FormItemValue, IFormItemConfig, IFormItemModel } from './FormInterface';
import Debug from 'debug';

const debug = Debug(module.id);

function dispose<T extends FormItemValue>(this: IFormItemModel<T>, fn: () => void) {
  // console.log('dispose', this.label);
  addDisposer(this, fn);
}
/** 表单项 MST 模型名称 */
const FormItemModelName = 'FormItemModel';
/** 默认异步校验节流防抖时间宽度设置(ms) */
const DefaultCheckDelay = 400;
/** 默认 fetch 节流防抖时间宽度设置(ms) */
const DefaultFetchDelay = 400;

let model: any;
/** 假装每次返回新的异步跟踪模型定义，但是其实只返回唯一的一份定义节约运行时资源。 */
function createFormItemModel<T extends FormItemValue>() {
  if (model) return model as typeof theModel;
  const theModel = types.model(FormItemModelName, {
    initialValue: types.frozen<T>(),
    value: types.frozen<T>(),
    label: '',
    prefix: '',
    suffix: '',
    tip: '',
    replaceHolder: '',
    emptyWarn: '',
    error: types.maybe(types.string),
    visible: true,
    required: false,
    disabled: false,
    readonly: false,
    checking: false,
    fetching: false,
    /** 是否做出过变更，不管最终是否和初始值一样 */
    dirty: false,
    /** 是否最后改变了最初的值 */
    changed: false,
    focusCount: 0,
    blurCount: 0,
    options: types.maybe(types.frozen<OptionObject[]>()),
    asOptions: types.maybe(AsyncTrack()),
    asCheck: types.maybe(AsyncTrack()),
    extra: types.frozen<any>({}),
  }).actions(self => {
    return {
      _setProp(k: string, v: any) {
        //@ts-ignore
        self[k] = v;
      },
      onFocus() {
        self.focusCount++;
      },
      onBlur() {
        self.blurCount++;
      },
    }
  }).views(self => {
    return {
      get focusing() {
        return self.focusCount > self.blurCount;
      },
    }
  }).actions(self => {
    let _cfg: IFormItemConfig<T>;
    return {
      set(v: T) {
        if (_cfg.set) {
          _cfg.set.call(self, v);
        } else {
          self.value = v;
        }
        self.dirty = true;
        self.changed = (self.initialValue !== self.value);
      },
      /** 重置表单项初始配置值 */
      reset() {
        this.set(self.initialValue);
        self.dirty = false;
        self.changed = false;
      },
      /** 不改动当前值，但是立即触发一次校验过程；dirty 的都已经发起过校验了 */
      touch: flow(function* () {
        if (!_cfg.check) return self.error;
        const result = _cfg.check!.call(self, self.value);
        if (result instanceof Promise) {
          self.error = ''; // 检查前先清空原来的状态
          self.checking = true;
          try {
            const error = yield result;
            self.error = error || '';
          } catch (e) {
            self.error = '校验服务异常';
          }
          self.checking = false;
        } else {
          self.error = result;
        }
        return self.error; // 最后返回最终校验结果
      }),
      afterCreate() {
        debug('FormItem afterCreate');
      },
      _initWithCfg(cfg: IFormItemConfig<T>) {
        _cfg = cfg;
        const setProp = self._setProp as unknown as (prop: string, v: string | boolean | undefined | OptionObject[]) => void;

        self.initialValue = cfg.value;
        // this.set(cfg.value); // 如果自定义set中改其他表单项，这时刻还未准备好引用
        self.value = cfg.value; // 初始值仅仅简单的按原样设置，不做任何额外的处理


        function handleProp(prop: string) {
          if (Object.getOwnPropertyDescriptor(cfg, prop)) {
            const descriptor = Object.getOwnPropertyDescriptor(cfg, prop)!;
            if (descriptor.get) {
              const getter = descriptor.get;
              // setProp(prop, getter.call(self));
              addDisposer(self, reaction(() => getter.call(self), (newVal) => setProp(prop, newVal), { fireImmediately: true }));
            } else if (descriptor.value !== undefined) {
              const fixedValue = descriptor.value;
              setProp(prop, fixedValue);
            } else {
              // props will be system default value
            }
          }
        }

        handleProp('label');
        handleProp('prefix');
        handleProp('suffix');
        handleProp('tip');
        handleProp('placeHolder');
        handleProp('emptyWarn');
        handleProp('visible');
        handleProp('required');
        handleProp('disabled');
        handleProp('readonly');
        handleProp('fetching');
        handleProp('options');

        // cfg.check 只做非空的检查；required 控制空检查，完全是同步检查
        if (cfg.check) {
          // 对录入变化执行 check，可能是异步的；也会在 item.check 中执行 cfg.check，比如在 onBlur/onSubmit 事件中
          // react to 表单项自己的值，同时 react to cfg.check 用到的各种 observable 数据
          let isBeforeFirstCheck = true;
          const emptyValue = null;
          addDisposer(self, reaction(() => {
            // console.log('check in reaction', self.label, self.value, self.required);
            // 无值情况在 required=true 时检查
            if (self.value === undefined || self.value === '') {
              if (self.emptyWarn === '') {
                ; // 什么也不做，用于不往后面分支处理，最终依赖 check 函数返回空值提示信息
              } else if (self.required) {
                return self.emptyWarn || `${self.label}不能为空`;
              } else {
                return emptyValue;
              }
            }
            // cfg.check 只处理非空值
            const newVal = cfg.check!.call(self, self.value);
            // 警告：下面代码必须放到本函数最后部分，确保上面的代码引用了参考的 observable 数据，才能实现对其变化的反应
            if (isBeforeFirstCheck) {
              isBeforeFirstCheck = false;
              return undefined; // 忽略第一次执行的结果，只用于订阅依赖；确保第一次计算结果和后面的计算不同，能触发对结果的响应
            }
            return newVal;
          }, (result) => {
            // console.log('checked after reaction', self.label, self.value, self.required);
            if (result === emptyValue) return; // 空值无check也无需处理
            setProp('error', ''); // 检查前先清空原来的状态
            if (result instanceof Promise) {
              setProp('checking', true);
              result.then(error => {
                setProp('error', error || '');
                setProp('checking', false);
              }).catch(() => {
                setProp('error', '校验服务异常');
                setProp('checking', false);
              })
            } else {
              setProp('error', result);
            }
          }, {
            delay: cfg.checkDelay || DefaultCheckDelay,
            fireImmediately: false,
          }));
        }

        if (cfg.fetch) {
          const getOptions = cfg.fetch.bind(self);
          addDisposer(self, reaction(getOptions, (result) => {
            if (result instanceof Promise) {
              setProp('fetching', true);
              result.then(options => {
                setProp('options', options);
                setProp('fetching', false);
              }).catch(() => {
                setProp('error', '选项服务异常');
                setProp('fetching', false);
              })
            } else {
              setProp('options', result);
            }
          }, {
            fireImmediately: true,
            delay: cfg.fetchDelay || DefaultFetchDelay,
          }))
        }

        // 任何方式options改变，如果当前值不在选项清单中，则设置成 undefined，确保用户知晓当前值已无效被清空了
        addDisposer(self, reaction(() => self.options, () => {
          if (!self.options) return; // 表单项没有选项的情况不做处理
          const current = self.value;
          if (self.value === undefined) return;
          const found = self.options?.find(opt => (!opt.disabled && opt.value === current));
          if (found) return;
          // 对于必填字段，而且没有填写过的情况，自动选择选项中第一个可用的条目
          if (self.required && !self.dirty) {
            const firstUsable = self.options?.find(opt => (!opt.disabled));
            this.set(firstUsable?.value as T);
          } else {
            // todo 是否摔死 this.set 还是直接该值，可能需要在考虑
            this.set(undefined as T);
          }
        }, {
          fireImmediately: true,
        }));

        // 直接将表单项配置中的 AsyncTrack 挂到表单项 MST 中
        if (cfg.asOptions) {
          self.asOptions = cfg.asOptions;
        }
        if (cfg.asCheck) {
          self.asCheck = cfg.asCheck;
        }
        if (cfg.setup) {
          cfg.setup.call(self, dispose.bind(self));
        }
      },
    }
  });
  model = theModel;
  return theModel;
}

// type FormItemModelType<T> = Instance<ReturnType<typeof createFormItemModel>>;
export function FormItem<T extends FormItemValue>(cfgCreator: (model: IFormItemModel<T>) => IFormItemConfig<T>) {
  const model = createFormItemModel<T>(); // 每次都返回同一个单例
  return types.optional(model, () => {
    const inst = model.create(); // 先无差别的创建一个表单项模型实例
    const cfg = cfgCreator(inst);
    inst._initWithCfg(cfg); // 再根据配置设置特定的表单项模型实例
    debug(`FormItem ${inst.label} at end of createFormItemModel`);
    return inst; // 全部设置完毕，对外才能看到
  });
}

export function walkForm(tree: IAnyStateTreeNode, cb: (formItem: IFormItemModel<any>) => void) {
  walk(tree, (item) => {
    const nodeType = getType(item);
    if (nodeType.name === FormItemModelName) {
      cb(item as IFormItemModel<any>);
    }
  });
}

/**
 * 将 MST 模型实例中的表单项类型提取，保持结构位置，变成普通数据
 * @param tree MST tree，其中在各个层级包含表单项模型实例
 * @returns 适合向后台提交的普通数据，保持 tree 中的结构
 */
export function getFormData(tree: IAnyStateTreeNode, ignoreInvisible = true) {
  const value: any = {};
  function setMountPointVal(item: IAnyStateTreeNode, cb: (mp: any, key: string) => void) {
    const paths = getPathParts(item);
    const key = paths.slice(-1)[0];
    let mountPoint = value;
    for (let i = 0; i < paths.length - 1; i++) {
      let deeper = mountPoint[paths[i]];
      // 逢山开路，遇水搭桥
      if (!deeper) {
        if (key === '0') {
          mountPoint[paths[i]] = deeper = [];
        } else {
          mountPoint[paths[i]] = deeper = {};
        }
      }
      mountPoint = deeper;
    }
    cb(mountPoint, key);
  }
  // 深度优先的
  // /cities/0
  // /cities
  // 只能在微循环后才能 walk 到所有节点
  // Promise.resolve().then(() => {
  walkForm(tree, (formItem) => {
    if (!ignoreInvisible || formItem.visible === false) return;
    setMountPointVal(formItem, (mp, key) => { mp[key] = formItem.value });
  });
  return value;
}

/** 重置表单项的值为初始配置值，不支持数组项目增减的恢复 */
export function resetFormData(tree: IAnyStateTreeNode) {
  runInAction(() => {
    walkForm(tree, (formItem) => {
      formItem.reset();
    });
  });
}

/** 设置表单项的值为指定配置值，不支持数组项目增减的恢复 */
export function setFormData(tree: IAnyStateTreeNode, data: any, asInitialData = false) {
  const prefixLen = getPathParts(tree).length;
  runInAction(() => {
    walkForm(tree, (item) => {
      const paths = getPathParts(item).slice(prefixLen);
      let current = data;
      for (let sect of paths) {
        current = current[sect];
        if (current === undefined) return; // ignore
      }
      if (asInitialData) {
        item._setProp('initialValue', current);
      }
      item.set(current);
    });
  });
}

/** touch 所有没有 touch 过的，也就是没有 check 过的，然后对于 promise 的填到 .all 中，等待全部完成，算作成功，否则 */
export async function checkForm(tree: IAnyStateTreeNode, earlyReturn = false) {
  // 先查到所有 !dirty 的，执行一遍 touch
  // 然后轮询全部的表单项，!checking 的收集，checking 的通过 when 收集checking完成事件，通过 Promise.all 获取最终结果
  let errorCount = 0;
  const checkingList = [] as Promise<boolean>[];
  runInAction(() => {
    walkForm(tree, (item) => {
      // console.log('start check', getPath(item), item.value);
      if (earlyReturn && errorCount > 0) {
        return;
      }
      if (!item.dirty) {
        // console.log('find not dirty and touch it', getPath(item), item.value);
        item.touch();
      }
      if (!item.checking) {
        // 无校验或者同步校验
        if (item.error) {
          errorCount += 1;
        }
      } else {
        // console.log('start async check', getPath(item), item.value);
        // 异步校验执行中的状态
        checkingList.push(new Promise(resolve => {
          when(() => !item.checking, () => {
            if (item.error) {
              errorCount += 1;
            }
            // console.log('end async check', getPath(item), item.value, item.error);
            resolve(!!item.error);
          });
        }));
      }
    });
  });
  if (earlyReturn && errorCount > 0) {
    return errorCount; // 返回已经发现的异常数量，大于0就带有存在校验不通过的情况，通常禁止提交
  }
  await Promise.all(checkingList);
  return errorCount;
}
