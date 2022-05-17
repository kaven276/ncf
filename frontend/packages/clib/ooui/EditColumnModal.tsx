import React, { useState, useEffect } from 'react';
import { Table, Modal, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { observable, action } from 'mobx';
import type { ColumnProps } from 'antd/es/table/Column';

const bodyStyle = {
  maxHeight: '60vh',
  overflow: 'auto',
};

function getText(title: string | any[] | { props: { children: any } }): string {
  let text = '';
  if (typeof title === 'string') {
    text = title;
  } else if (title instanceof Array) {
    return title;
  } else {
    const { props: { children } } = title;
    return children ? getText(children) : title;
  }
  return text;
}

function sortIndex(before: number, after: number) {
  if (before === after) {
    return '';
  } else if (before > after) {
    return 'iconfont icon-caretup';
  } else {
    return 'iconfont icon-caretdown';
  }
}

export interface IColumnMeta {
  fieldset: string,
  id: string,
  disabled: boolean,
  record: { [key: string]: any },
}

function EditColumnModal_(p: {
  /** 是否显示 */
  visible: boolean,
  /** 必须保证有的列清单，其中的列不能在列设置中去除 */
  requiredColunms?: string[]
  /** 取消关闭自己 */
  close: () => void,
  originColumns: ColumnProps<any>[],
  /** 回调函数，通知上级设置设置过的列配置 */
  setConfiguredColumns: (c?: ColumnProps<any>[]) => void,
}) {
  const [m] = useState(() => observable(({
    /** 原始列清单的列数量，用于判断设置结果是否列太少 */
    originColumnsLength: p.originColumns.length,
    selectedRowKeys: p.originColumns.map(({ key, dataIndex }) => (key || dataIndex)),
    dataSource: p.originColumns.map(item => ({
      fieldset: item.title,
      id: item.key || item.dataIndex,
      disabled: !!p.requiredColunms?.includes(item.key || item.dataIndex),
      record: { ...item },
    })) as IColumnMeta[],
    backup: p.originColumns.map(item => item.key || item.dataIndex),
    onSelectRowKeysChange: (selectedRowKeys: string[]) => {
      m.selectedRowKeys = selectedRowKeys;
    },
    upColumnSort: (index: number) => {
      const { dataSource: ds } = m;
      ds.splice(index - 1, 2, ds[index], ds[index - 1]);
      m.dataSource = [...ds]; // 使得 antd Table 能刷新
    },
    downColumnSort: (index: number) => {
      const { dataSource: ds } = m;
      ds.splice(index, 2, ds[index + 1], ds[index]);
      m.dataSource = [...ds]; // 使得 antd Table 能刷新
    },
    onOk: () => {
      if (m.originColumnsLength >= 3 && m.selectedRowKeys.length < 3) {
        message.error('至少保留3项！');
      } else if (m.originColumnsLength < 3 && m.selectedRowKeys.length < m.originColumnsLength) {
        message.error('当前表头显示项不可删减！');
      } else {
        // 保持设置顺序回传选中显示的列的标识清单
        p.setConfiguredColumns(m.dataSource.filter(({ id }) => m.selectedRowKeys.includes(id)).map(row => row.record));
        p.close();
      }
    },
    get columns(): ColumnProps<IColumnMeta>[] {
      return [
        {
          title: '显示顺序',
          dataIndex: 'sort',
          render: (_, row, index) => index + 1,
        },
        {
          title: '字段名',
          dataIndex: 'fieldset',
          render: (v, { id }, index) => (
            <span>{getText(v)}&nbsp;
              <i style={{ fontSize: '10px', color: '#00a0e9' }} className={sortIndex(m.backup.findIndex(i => i === id), index)} />
              {/* {sortIndex(m.backup.findIndex(i => i === id), index)} */}
            </span>
          ),
        },
        {
          title: <div style={{ paddingRight: '20px', textAlign: 'right' }}>操作</div>,
          dataIndex: 'handle',
          render: (_, row, index) => (
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <span style={{ display: 'inline-block', width: '22px' }}>
                {index !== 0 && (
                  <i className="iconfont icon-up-circle-o" style={{ color: '#108ee9' }} onClick={() => m.upColumnSort(index)} ></i>
                )}
              </span>
              <span style={{ display: 'inline-block', width: '22px' }}>
                {index !== m.dataSource.length - 1 && (
                  <i className="iconfont icon-down-circle-o" style={{ color: '#108ee9' }} onClick={() => m.downColumnSort(index)} ></i>
                )}
              </span>
            </div>
          ),
        },
      ];
    },
  }), {
    onSelectRowKeysChange: action,
    upColumnSort: action,
    downColumnSort: action,
    onOk: action,
  }));

  // 只要设置或者取消，都要备份上次的 id 顺序清单，这样在编辑可以识别自上一次顺序是否改变
  useEffect(() => {
    if (p.visible === true) return;
    m.backup = m.dataSource.map(({ id }) => id);
  }, [p.visible]);

  return (
    <Modal visible={p.visible} bodyStyle={bodyStyle} title="自定义表头显示项" onOk={m.onOk} onCancel={p.close} >
      <Table
        size="small"
        rowKey="id"
        columns={m.columns}
        dataSource={m.dataSource}
        pagination={false}
        rowSelection={{
          selectedRowKeys: m.selectedRowKeys,
          getCheckboxProps: ({ disabled }) => ({ disabled }),
          onChange: (selectedRowKeys: React.Key[]) => m.onSelectRowKeysChange(selectedRowKeys as string[]),
        }}
      />
    </Modal>
  );
}

export const EditColumnModal = observer(EditColumnModal_);
