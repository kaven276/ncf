import { observable, reaction } from 'mobx';
import {
  FormItemValue,
  IFormItemConfig,
  IFormItemModel,
} from './FormInterface';

export function makeFormItem<T extends FormItemValue>(obj: IFormItemConfig<T>): IFormItemModel<T> {
  const cfg = observable.object(obj, undefined, {
    deep: false,
    autoBind: true,
  });
  cfg.defaultValue = cfg.value;
  if (!cfg.set) {
    cfg.set = (v: any) => cfg.value = v;
  }

  if (Array.isArray(cfg.value)) {
    Object.assign(cfg, {
      /** 比默认值添加的选项列表，方便后台参照尝试插入数据 */
      get plusItems(): string[] {
        return (cfg.value as unknown as string[]).filter(item => !(cfg.defaultValue as unknown as string[])!.includes(item));
      },
      /** 比默认值减少的选项列表，方便后台参照尝试删除数据 */
      get minusItems(): string[] {
        return (cfg.defaultValue as unknown as string[]).filter(item => !(cfg.value as unknown as string[]).includes(item));
      },
    });
  }

  if (cfg.setup) {
    Promise.resolve().then(() => {
      cfg.setup!.call(cfg);
    });
  }

  // warning: 注意不能用 obj.options 判断其有无，而要使用 'options' in obj 方式判断；
  // 因为会导致计算值计算，计算值函数可能引用表单配置还未被初始化导致报异常
  if ('options' in cfg) {
    // 当录入选项列表改变，可能需要相应的调整当前的多选或者单选的值
    reaction(() => cfg.options, (newOption) => {
      if (Array.isArray(cfg.value)) {
        const filteredValue = (cfg.value as unknown as string[]).filter(oneValue => newOption!.find(opt => opt.value === oneValue));
        cfg.set!(filteredValue as T);
      } else {
        // 新的选项列表无当前表单项值的话，则自动选择新列表第一项的值
        if (!(newOption!.find(opt => opt.value === cfg.value))) {
          //@ts-ignore
          cfg.set!(newOption![0]!.value);
        }
      }
    });
  }

  // console.log('formItem', cfg.label);
  return cfg as IFormItemModel<T>;
}