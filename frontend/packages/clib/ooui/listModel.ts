import type { RequestPagination, ResponsePagination } from './Pagination';
import { createContext } from 'react';

export type IListModelProps<ID extends string | number = string> = {
  /** 列表 title，将显示到 Toolbar 最左侧 */
  title?: string,
  /** 选中行的ID清单，会用于在封装的 Table 组件中自动绑定选中 */
  selected?: ID[],
  /** 保存每笔操作的 actionModel 实例，用于在 redux devtool 方便查看 */
  logs?: any[],
}

export type IListModelViews<Item> = {
  /** 列表数据，会用于在封装的 Table 组件中自动绑定 dataSource */
  list: Item[],
  /** list 中选中的条目清单，需要 listModel 配置，actionModel.create().execute(idList, m.selectedItems) 供参考*/
  selectedItems?: Item[],
}

export type IListModelActions<ID extends string | number = string> = {
  /** 从 antd table 同步选中行调用 */
  setSelected?: ((selected: ID[]) => void),
  /** 查询，对应 Toolbar 右侧的查询 Input.Search.onSearch */
  search?: (str: string) => void,
  /** 在 MST 中记录每一笔操作的 MST 实例数据到 log 数组中 */
  log?: Function,
  /** refresh，驱动 Toolbar 最后侧渲染刷新图标，点击执行本 action。各类对象操作完自动调用本 action。 */
  refresh: () => void,
}

/** 列表模型必须要符合的规范 */
export interface IListModel<ID extends string | number = string, Item = any>
  extends IListModelProps<ID>, IListModelViews<Item>, IListModelActions<ID> {
  /** 跟踪查询框录入, MST form 的 FormItem 格式 */
  searchKey?: {
    /** 当前录入的查询条件 */
    value: string,
    /** 记录查询框录入文本 */
    set: (text: string) => void,
    placeHolder?: string,
  },
  /** 执行本函数获取列表数据 */
  fetch: (pg?: RequestPagination, filters?: { [key: string]: string }, orderType?: 'ASC' | 'DESC') => Promise<any>,
  /** 用于 loading 追踪的 AsyncTrack 实例 */
  asList: {
    /** is pending */
    p: boolean,
    /** 感知已完成 */
    o: boolean,
    d?: ResponsePagination | {},
  },
}

/** 列表模型必须要符合的规范 */
export interface IDetailModel {
  /** 列表 title，将显示到 Toolbar 最左侧 */
  id: string | number,
  /** 对象详情信息，来自 asXxxDetail.d 的计算值 */
  detail: any,
  /** 执行本函数获取列表数据 */
  fetch: () => Promise<any>,
  /** 在 MST 中记录每一笔操作的 MST 实例数据到 log 数组中 */
  log?: Function,
}

/** 用于方便传递列表 MST 模型实例的 react context */
export const ListOrDetailModelContext = createContext<IListModel | IDetailModel>({
  title: '对象列表',
  fetch: async () => { },
  asList: { p: false, o: false },
  list: [],
  selected: [],
  setSelected: () => { },
  refresh: async () => undefined,
});

/** 列表模型中提供 actionModel.execute 的两个入参 */
interface IListWithActionsModel<ID extends string | number = string> {
  /** 选中行的ID清单，会用于在封装的 Table 组件中自动绑定选中 */
  selected?: ID[],
  /** 选中行的数组，来自原始列表数据 filter selected */
  selectedItems?: any[],
}

/** 详情模型中提供 actionModel.execute 的两个入参 */
interface IDetailWithActionsModel<ID extends string | number = string> {
  /** 详情对象 id */
  id?: ID,
  /** 详情对象的详细信息 */
  detail?: any,
}

/** 列表模型和详情模型中都存在的成员 */
interface ICommonWithActionsModel {
  /** 执行刷新，对象变更操作完成后自动执行 */
  refresh: () => Promise<any>,
  /** 在 MST 中记录每一笔操作的 MST 实例数据到 log 数组中 */
  log?: Function,
}

/** action 执行需要的详情模型或列表模型所需的成员信息 selected,id 必须有一个存在，分别为 list/detail 场景 */
export type IObjectWithActionsModel<ID extends string | number = string> =
  ICommonWithActionsModel & (IListWithActionsModel<ID> & IDetailWithActionsModel<ID>);
