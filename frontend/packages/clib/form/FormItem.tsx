import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Mentions, Input, InputNumber, Switch, DatePicker, Select, Radio, Checkbox, Slider } from 'antd';
import { Moment } from 'moment';
import moment from 'moment';

import { FormContext } from './FormItemLayout';
import {
  OptionObject,
  IFormItemModel,
} from './FormInterface';


export function valueDisplay(item: IFormItemModel<T>) {
  let value: string;
  if (Array.isArray(item.value)) {
    value = item.value.join(', ');
  } else {
    switch (typeof item.value) {
      case 'string':
        value = item.value;
        break;
      case 'number':
        value = String(item.value);
        break;
      case 'boolean':
        value = item.value ? '是' : '否';
        break;
      default:
        value = '未知类型！';
    }
  }
  return value;
}

// 在 Form 一级设置 FormItemLayout 用哪种，通过 useContext 获取配置

export type TFormItemLayout = (props: {
  item: IFormItemModel<T>,
  children?: React.ReactElement,
  extra?: any,
}) => React.ReactNode;


/** form item 标准框架，children 为最终落地的表单录入元素，自动为其添加 value/onChange 等数据设置 */
export const FormInput = observer(({
  item,
  viewer,
  children,
  extra,
}: {
  item: IFormItemModel<any>,
  viewer?: TFormItemLayout,
  children?: IReactComponent<any>,
  extra?: any,
}) => {
  let { autoInputType, formId } = useContext(FormContext);

  if (item.visible === false) {
    return null;
  }
  const attrs = {} as any;
  if (item.placeHolder) {
    attrs.placeholder = item.placeHolder;
  }
  if (formId && item.labelId) {
    attrs.id = `${formId}_${item.labelId}`;
  }
  if (item.defaultValue !== undefined) {
    // attrs.defaultValue = item.defaultValue; // controlled form element do not use defaultValue
    // defaultChecked
  }
  let element: React.ReactElement;

  // 标准化选项列表格式，方便后面使用统一方式处理
  let options: OptionObject[] | undefined = item.options;

  // if (item.labelId === 'name') {
  //   console.log('children', children);
  // }

  // 当应用表单代码完全不配置录入元素时，系统自动选择合适的录入元素，免去开发细节的麻烦
  // rule1：有 options 的使用选择录入，无则使用普通 input 录入
  // rule2: 选择录入，当选项较多，智能选择 select；选项较少则智能选择 input type=checkbox/radio 来完全展开选项
  if (!children) {
    if (!options) { // 直接录入，非选择
      if (autoInputType === 'html') {
        element = (<input />);
      } else if (autoInputType === 'antd') {
        if (typeof item.value === 'boolean') {
          element = (<Switch />);
        } else {
          element = (<Input />);
        }
      }
    } else if (Array.isArray(item.value)) { // 选择多值
      if (options.length < 8) {
        if (autoInputType === 'html') {
          element = (<input type="checkbox" />);
        } else if (autoInputType === 'antd') {
          element = (<Checkbox.Group />);
        }
      } else {
        if (autoInputType === 'html') {
          element = (<select multiple />);
        } else if (autoInputType === 'antd') {
          element = (<Select mode="multiple" />);
        }
      }
    } else { // 选择单值
      if (options.length < 8) {
        if (autoInputType === 'html') {
          element = (<input type="radio" />);
        } else if (autoInputType === 'antd') {
          element = (<Radio.Group />);
        }
      } else {
        if (autoInputType === 'html') {
          element = (<select />);
        } else if (autoInputType === 'antd') {
          element = (<Select />);
        }
      }
    }
  }
  //@ts-ignore
  if (!element) {
    element = children;
  }

  // input 元素没有指定 type 类型时，自动根据模型值类型推导并设置
  let inputType = element.props.type;
  if (element.type === 'input' && !inputType) {
    switch (typeof item.defaultValue) {
      case 'number':
        attrs.type = inputType = 'number';
        break;
      case 'string':
        attrs.type = inputType = 'text';
        break;
      case 'boolean':
        attrs.type = inputType = 'checkbox';
        break;
    }
  }

  if (!Array.isArray(item.value)) {

  } else {
    // 数组的场景，各种多选
  }

  if (element.type === 'input') {
    // console.log('item is input', item.label);
    if (inputType === 'checkbox') {
      if (options && options.length > 0) {
        // 使用 <input type="checkbox"/> 进行多选
        const checkboxes = options!.map(opt => (
          <label key={opt.value}>
            {React.cloneElement(element, {
              value: opt.value, name: item.labelId,
              checked: (item.value as (string | number)[]).includes(opt.value),
              disabled: opt.disabled,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const el = e.target;
                if (el.checked) {
                  item.set([...item.value, el.value]);
                } else {
                  item.set((item.value as string[]).filter(v => v !== el.value));
                }
              },
            })}
            <span>{opt.label}</span>
          </label>
        ));
        element = (<div>{checkboxes}</div>);
      } else {
        // 单选
        attrs.checked = item.value;
        attrs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => item.set(e.target.checked);
        attrs.disalbed = item.disabled;
      }
    } else if (inputType === 'radio') {
      // 使用 <input type="radio"/> 进行单选
      const radios = options!.map((opt) => (
        <label key={opt.value}>
          {React.cloneElement(element, {
            value: opt.value, name: item.labelId,
            checked: item.value?.includes(opt.value),
            disabled: item.disabled,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                item.set(e.target.value)
              }
            },
          })}
          <span>{opt.label}</span>
        </label>
      ));
      element = (<div>{radios}</div>);
    } else if (inputType === 'number') {
      attrs.value = item.value;
      attrs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => item.set(+e.target.value);
    } else {
      attrs.value = item.value;
      attrs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => item.set(e.target.value);
    }
  } else if (element.type === 'textarea') {
    attrs.value = item.value;
    attrs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => item.set(e.target.value);
  } else if (element.type === Input || element.type === Input.Password) {
    attrs.value = item.value;
    attrs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => item.set(e.target.value);
  } else if (element.type === Input.TextArea) {
    attrs.value = item.value;
    attrs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => item.set(e.target.value);
  } else if (element.type === Input.Search) {
    attrs.value = item.value;
    attrs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => item.set(e.target.value);
  } else if (element.type === InputNumber) {
    attrs.value = item.value;
    attrs.onChange = (num: number) => item.set(num);
  } else if (element.type === Slider) {
    attrs.value = item.value;
    attrs.onChange = (num: number) => item.set(num);
  } else if (element.type === Radio.Group) {
    if (options && options.length > 0) {
      const { buttonStyle } = element.props;
      if (buttonStyle && ['outline', 'solid'].includes(buttonStyle)) {
        element = (
          <Radio.Group {...element.props} value={item.value} disabled={item.disabled} onChange={e => item.set(e.target.value)}  >
            {options.map(item => (
              <Radio.Button key={item.value} value={item.value} disabled={!!item.disabled}>{item.label}</Radio.Button>
            ))}
          </Radio.Group>
        );
      } else {
        element = (<Radio.Group {...element.props} options={options} value={item.value} disabled={item.disabled} onChange={e => item.set(e.target.value)} />);
      }
    } else {
      // alert(`"${item.label}" Radio.Group 的模型必须是带 options 清单才能使用！`);
    }
  } else if (element.type === Radio) {
    alert(`"${item.label}" Radio 不独立使用，请使用 Radio.Group ！`);
  } else if (element.type === Checkbox.Group) {
    if (options && options.length > 0) {
      element = (<Checkbox.Group {...element.props} options={options} value={item.value} disabled={item.disabled} onChange={item.set} />);
    } else {
      // alert(`"${item.label}" Checkbox.Group 的模型必须是带 options 清单才能使用！`);
    }
  } else if (element.type === Checkbox) {
    if (typeof item.value === 'boolean') {
      const onChange = (e: any) => item.set(e.target.checked);
      element = (<Checkbox {...element.props} checked={item.value} disabled={item.disabled} onChange={onChange} />);
    } else {
      // alert(`"${item.label}" Checkbox 的模型value 类型为 boolean 才能使用！`);
    }
  } else if (element.type === DatePicker) {
    const { format } = element.props;
    const type = (typeof item.value) as 'number' | 'string';
    // console.log('DatePicker', item.label, format, type);
    if (type === 'string') {
      attrs.value = item.value ? moment(item.value, format) : null;
      if (!attrs.onChange) {
        attrs.onChange = (date: Moment | null) => {
      console.log(item.value,'===item.value',date)

          item.set(date ? date.format(format) : '');
        }
      }
    } else if (type === 'number') {
      attrs.value = item.value ? moment.unix(item.value) : null;
      if (!attrs.onChange) {
        attrs.onChange = (date: Moment | null) => item.set(date ? date.unix() : undefined);
      }
    }
  } else if (element.type === DatePicker.RangePicker) {
    const { format } = element.props;
    if (!attrs.value) {
      attrs.value = [];
      if (item.value[0]) {
        attrs.value[0] = moment(item.value[0], format);
      }
      if (item.value[1]) {
        attrs.value[1] = moment(item.value[1], format);
      }
    }
    if (!attrs.onChange) {
      attrs.onChange = (dates: any, dateStrings: string[]) => item.set(dateStrings);
    }
  } else if (element.type === 'select') {
    attrs.value = item.value;
    if (Array.isArray(item.value)) {
      // 多选
      attrs.multiple = true;
      attrs.onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        item.set([...e.target.selectedOptions].map(opt => opt.value));
      }
    } else {
      // 单选
      if (element.props.multiple) {
        alert(`表单项"${item.label}"是单选，不能为 <select> 设置 multiple`);
      }
      attrs.multiple = false;
      attrs.onChange = (e: React.ChangeEvent<HTMLSelectElement>) => item.set(e.target.value);
    }

    // 如果没有 options，自动加上
    // item.option 可以有各种格式 [string] [{value,label}] [[value,label]]
    // console.log(element);
    if (!element.props.children) {
      attrs.children = options!.map(opt => (
        <option value={opt.value} key={opt.value} disabled={opt.disabled}>{opt.label}</option>
      ));
    }
  } else if (element.type === Select) {
    attrs.value = item.value;
    if (item.placeHolder && !element.props.placeholder) {
      attrs.placeholder = item.placeHolder;
    }

    if (element.props.multiple || Array.isArray(item.value)) {
      // 多选
      attrs.onChange = (value: string | number) => {
        item.set(value);
      }
    } else {
      // 单选
      attrs.onChange = (value: string) => item.set(value);
    }

    // 如果没有 options，自动加上
    // item.option 可以有各种格式 [string] [{value,label}] [[value,label]]
    // console.log(element);
    if (!element.props.children) {
      attrs.children = options!.map(opt => (
        <Select.Option title={opt.label} key={opt.value} value={opt.value} disabled={opt.disabled} >{opt.label}</Select.Option>
      ))
    }
  } else if (element.type === Switch) {
    attrs.checked = item.value;
    attrs.onChange = (b: boolean) => item.set(b);
  } else if (element.type === Mentions) {
    attrs.value = item.value;
    attrs.onChange = (value: string) => item.set(value);
    if (!element.props.children) {
      attrs.children = options!.map(opt => (
        <Mentions.Option value={String(opt.value)} key={String(opt.value)}>{opt.label}</Mentions.Option>
      ))
    }
  } else {
    return element;
  }
  if (item.disabled !== undefined) {
    attrs.disabled = item.disabled;
  }
  attrs.onFocus = () => item.onFocus?.();
  attrs.onBlur = () => item.onBlur?.();
  return React.cloneElement(element, attrs);
  // return useObserver(() => (
  //   <FormItemLayout item={item}>{React.cloneElement(element, attrs)}</FormItemLayout>
  // ));

  // return (
  //   <Observer>{() => (
  //     <FormItemLayout item={item}>{React.cloneElement(element, attrs)}</FormItemLayout>
  //   )}</Observer>
  // );

  // 下面方式不行，因为 FormItemLayout 没有套 observer
  // return <FormItemLayout item={item}>{React.cloneElement(element, attrs)}</FormItemLayout>
});

export const FormField = observer(({
  item,
  viewer,
  children,
  extra,
}: {
  item: IFormItemModel<any>,
  viewer?: TFormItemLayout,
  children?: IReactComponent<any>,
  extra?: any,
}) => {
  let { FormItemLayout } = useContext(FormContext);
  if (viewer) {
    FormItemLayout = viewer;
  }
  if (item.visible === false) {
    return null;
  }
  if (item.readonly) {
    return FormItemLayout({
      item,
      children: <span>{valueDisplay(item)}</span>,
    });
  }
  return FormItemLayout({
    item,
    children: <FormInput item={item} children={children} />,
    extra,
  });
});
