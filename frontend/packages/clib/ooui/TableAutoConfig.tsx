import React, { Fragment, useState, useContext } from 'react';
import { IListModel, ListOrDetailModelContext } from './listModel';
import { Table, TableProps, Tooltip } from 'antd';
import { cloneElement } from 'react';
import { observer } from 'mobx-react-lite';
import { EditColumnModal } from './EditColumnModal';
import type { ColumnProps } from 'antd/es/table/Column';
import { convertToAntTable, convertFromAntTable } from 'clib/ooui/Pagination';
import './style.less';


function EmptyRefresh(p: {
  refresh?: () => Promise<void>,
}) {
  return (
    <div className="dash-widget">
      <div className="widget-content no-record">
        <div className="no-record-icon"><i className="iconfont icon-details" /></div>
        <div className="no-record-title">暂无数据</div>
        <p>暂时没有相关使用信息，尝试<a onClick={() => p.refresh?.()}>刷新</a>或检查机器</p>
      </div>
    </div>
  )
}

function TableAutoConfig_(p: {
  /** 列表 MST 模型实例 */
  // listModel: IListModel,
  /** 是否可以设置 Table Columns，默认超过4列可以，小于等于4列不可以 */
  setColumnsAble?: boolean,
  /** 必须保证有的列清单，其中的列不能在列设置中去除 */
  requiredColunms?: string[],
  /** 是否自动设置 antd pagination，默认 true */
  autoPagination?: boolean,
  children: ReturnType<typeof Table>,
}) {
  const table = p.children;
  const originColumns = table.props.columns as ColumnProps<any>[];
  // const m = p.listModel;
  const m = useContext(ListOrDetailModelContext) as IListModel;
  const [editing, setEditing] = useState(false);
  const [configuredColumns, setConfiguredColumns] = useState<ColumnProps<any>[]>();

  const Setting = {
    title: (
      <div style={{ float: 'right' }}>
        <Tooltip title="自定义列表项">
          <i className="iconfont icon-xitongguanli" onClick={() => setEditing(true)} />
        </Tooltip>
      </div>
    ),
    dataIndex: 'columnsSetting',
    width: '40px',
  }

  const { setColumnsAble = originColumns.length > 4 } = p;
  const current = configuredColumns || originColumns;
  const { autoPagination = true } = p;
  const paginationFromResponse = (!!autoPagination && m.asList.o) ? convertToAntTable(m.asList.d!) : {};
  // console.log('paginationFromResponse', paginationFromResponse);

  const resultTable = cloneElement(table, {
    scroll: table.props.scroll || { y: window.innerHeight - 240 },
    dataSource: m.list,
    loading: m.asList.p,
    pagination: paginationFromResponse ? {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: () => `共${paginationFromResponse.total}条`,
      ...paginationFromResponse,
    } : false,
    locale: { ...table.props.locale, emptyText: table.props.local?.emptyText || <EmptyRefresh refresh={m.refresh} /> },
    columns: setColumnsAble ? [...current, Setting] : current,
    rowSelection: m.setSelected ? {
      ...table.props.rowSelection,
      selectedRowKeys: m.selected as React.Key[],
      onChange: (selectedRowKeys: number[] | string[]) => m.setSelected!(selectedRowKeys),
    } : undefined,
    onChange: (pagination, filters, sorter) => {
      console.log({ filters });
      const pg = convertFromAntTable(pagination);
      const filters2 = {} as { [key: string]: string };
      for (let key in filters) {
        const filterValues = filters[key];
        // filter 重置的或者值为空数组的情况，不往 fetch 传，最终调用接口不带该参数，否则后台接口可能会处理不了(从黄河了解)
        if (filterValues !== null && filterValues.length > 0) {
          filters2[key] = filterValues.join(',')
        }
      }
      let orderType: 'ASC' | 'DESC' | undefined = (() => {
        if (sorter) {
          if (sorter.order === 'ascend') {
            return 'ASC';
          } else {
            return 'DESC';
          }
        }
      })();

      m.fetch(pg, filters2, orderType);
    },
  } as TableProps<any>);

  return (
    <Fragment>
      {resultTable}
      {/* 第一次编辑，或者曾经配置过列，则保持 EditColumnModal 实例存在，hold 其上次配置的状态 */}
      {(editing || configuredColumns) && (
        <EditColumnModal
          visible={editing}
          originColumns={originColumns}
          requiredColunms={p.requiredColunms}
          close={() => setEditing(false)}
          setConfiguredColumns={setConfiguredColumns}
        />)}
    </Fragment>
  )
}

/** 结合 MST 标准列表模型，自动配置 antd Table */
export const TableAutoConfig = observer(TableAutoConfig_);

// todo 自动跟踪 listModel.fetch flow 是否正在执行，不依赖于 m.asList.p 的存在
