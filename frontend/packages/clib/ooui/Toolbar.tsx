import React, { ReactNode, useContext } from 'react';
import { Form, Input, Tooltip } from 'antd';
import { FormItemLayoutAntd } from 'clib/form/FormItemLayout';
import { FormContainer } from 'clib/form';
import { ListOrDetailModelContext, IListModel } from './listModel';
import { observer } from 'mobx-react';

const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 15 },
  },
};

const toolbarStyle: React.CSSProperties = {
  margin: '8px 16px',
  display: 'flex',
  justifyContent: "space-between",
}
const rowSpaceStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateRows: '1fr',
  gridAutoColumns: '',
  gridAutoFlow: 'column',
  gap: '8px',
  alignContent: 'center',
  alignItems: 'center',
};
const searchStyle = {

};

interface ToolbarProps {
  legend?: {
    text: string,
  },
  onZoneChange?: (zone: string) => void,
  search?: string,
  /** 设置查询框的回调，不设置不显示查询框 */
  onSearch?: (text: string) => void,
  /** 设置刷新回调，不设置不显示刷新操作 icon */
  children?: ReactNode
}
export function Toolbar_(p: ToolbarProps) {
  const m = useContext(ListOrDetailModelContext) as IListModel;
  return (
    <div style={toolbarStyle}>
      <Form style={rowSpaceStyle} {...formItemLayout} layout="inline" hideRequiredMark={false} labelAlign="right" colon={false} >
        {m.title && (
          <div style={{ fontSize: 'larger' }}>{m.title}</div>
        )}
        {m.selected && false && (
          <Tooltip title={m.selected.join(',')}>
            <span>[{m.selected.length}]</span>
          </Tooltip>
        )}
        {/* 查询条件表单区域，使用标准的 MST FORM，wrapper 内置，children 中写各个表单项 FormField 即可 */}
        <FormContainer FormItemViewer={FormItemLayoutAntd} autoInputType='antd' formId="switch2" >
          {p.children}
        </FormContainer>
      </Form>
      {/* 右侧区域 */}
      <div className="action-btns right"
        style={rowSpaceStyle}>
        {m.searchKey && (
          <Input.Search
            disabled={false}
            className="action-btn"
            placeholder={m.searchKey.placeHolder ?? '输入主机名、标签名、应用名查询'}
            style={searchStyle || { width: 220 }}
            value={m.searchKey!.value}
            onChange={(evt) => m.searchKey!.set(evt.target.value)}
            onSearch={(value) => m.search?.(value)}
          />
        )}
        {/* {showDownload && (
          <a
            className="action-download"
            onClick={() => this.triggerChange({ key: 'download' })}
          ><Tooltip title={downloadTitle || '下载'}><i className={`iconfont icon-${downloadIcon || 'export'}`} /></Tooltip>
          </a>
        )} */}
        {/* 如果 listModel 中定义了 refresh action，则渲染，点击执行 m.refresh */}
        {m.refresh && (
          <a
            className="action-reload"
            onClick={() => m.refresh!()}
          ><Tooltip title="刷新"><i className="iconfont icon-refresh" /></Tooltip>
          </a>
        )}
      </div>
    </div>
  )
}

export const Toolbar = observer(Toolbar_);
