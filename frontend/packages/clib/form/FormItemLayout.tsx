import React, { useContext, createContext } from 'react';
import { valueDisplay, TFormItemLayout } from './FormItem';
import { Form } from 'antd';
import s from './FormItem.m.less';

export const FormItemLayout1: TFormItemLayout = ({
  item,
  children,
}) => {
  const { formId } = useContext(FormContext);
  const htmlId = `${formId}_${item.labelId}`;
  return (
    <>
      <label className={s.label} htmlFor={htmlId}>
        {item.required !== false && (
          <span className={s.requiredMark}>*</span>
        )}
        <span>{item.label}</span>
      </label>
      <div className={s.content}>
        <div className={s.input}>
          {item.prefix}
          {children}
          {item.suffix}
        </div>
        {item.tip && (
          item.tip.split('\n').map((line, i) => (<span key={i} className={s.tip}>{line}</span>))
        )}
        {item.plusItems && (
          <div>新增选择 {item.plusItems.join(', ')}</div>
        )}
        {item.minusItems && (
          <div>去除选择 {item.minusItems.join(', ')}</div>
        )}
        {item.error && (
          <div className={s.error}>{item.error}</div>
        )}
      </div>
    </>
  )
}

export const FormItemLayout2: TFormItemLayout = ({
  item,
  children,
}) => {
  return (
    <label className={s.itemRow}>
      <div className={s.form2Label}>
        {item.required !== false && <span className={s.requiredMark}>*</span>}
        <span>{item.label}</span>
      </div>

      <div className={s.form2Input}>
        <div className={s.input}>
          {item.prefix}
          {children}
          {item.suffix}
        </div>
        {item.tip && (item.tip.split('\n').map((line, i) => (<span key={i} className={s.tip}>{line}</span>)))}
        {item.error && <div className={s.error}>{item.error}</div>}
      </div>
    </label>
  )
}

const spaceStyle: React.CSSProperties = {
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateColumns: 'auto auto',
  gap: '0px',
  alignItems: 'center',
}
export const FormItemLayoutAntd: TFormItemLayout = ({
  item,
  children,
  extra,
}) => {
  const checking = (item.asCheck && item.asCheck.p);
  const validateStatus = checking ? 'validating' : (item.error ? 'error' : 'success');
  return (
    <Form.Item
      label={item.label}
      hasFeedback={true}
      // validateStatus={validateStatus}
      help={checking ? '检查中...' : (item.error)}
      extra={item.tip}
      required={item.required}
      className={item.focusing ? s.focusing : ''}
    >
      <div>
        <div style={spaceStyle}>
          {item.prefix && item.prefix}
          {children}
          {item.suffix && item.suffix}
          {extra?.rightComp}
        </div>
      </div>

    </Form.Item>
  )
}

export const FormItemLayoutViewOnly: TFormItemLayout = ({
  item,
  children,
}) => {
  let value: string = valueDisplay(item);
  return (
    <>
      <label className={s.label}>
        <span>{item.label}</span>
      </label>
      <div className={s.content}>
        <div className={s.input}>
          {item.prefix}
          {value}
          {item.suffix}
        </div>
      </div>
    </>
  )
}


type AutoInputType = 'antd' | 'html';
export const FormContext = createContext({
  FormItemLayout: FormItemLayout1 as TFormItemLayout,
  autoInputType: 'antd' as AutoInputType,
  formId: 'onlyone',
});

export function FormContainer({
  FormItemViewer,
  children,
  autoInputType = 'html',
  formId,
}: {
  FormItemViewer?: typeof FormItemLayoutViewOnly,
  autoInputType?: AutoInputType,
  formId: string,
  children: React.ReactNode,
}) {
  return (
    <FormContext.Provider value={{
      FormItemLayout: FormItemViewer || FormItemLayout1,
      autoInputType,
      formId,
    }}>
      {children}
    </FormContext.Provider>
  );
}
