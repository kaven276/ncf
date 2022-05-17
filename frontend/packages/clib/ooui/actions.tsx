import React, { useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Menu, Dropdown, Tooltip } from 'antd';
import { ButtonType } from 'antd/es/button';
import { ListOrDetailModelContext, IObjectWithActionsModel } from './listModel';
import { DownOutlined, MenuOutlined, PlusOutlined, TagOutlined } from '@ant-design/icons';
import './style.less';

type Record<t = any> = any;

/** 支持无人工接入对象操作的 MST model 所需要满足的规范 */
interface IActionModel<ID extends string | number = string> {
  /** 最终向后台提交操作命令，最终返回 true 代表中间取消了，为最终提交后台 */
  // execute: ((id: number[] | string[]) => Promise<boolean | undefined>) | ((id: number[]) => Promise<boolean | undefined>) | ((id: string[]) => Promise<boolean | undefined>);
  // execute: ((id: number[] | string[]) => Promise<boolean | undefined>);
  execute: ((id: ID[], selectedItems?: any[]) => Promise<boolean | undefined>)
}

function Icon(p: {
  type: string,
}) {
  if (p.type === 'down') {
    return (<DownOutlined />);
  } else if (p.type === 'menu') {
    return (<MenuOutlined />);
  } else if (p.type === 'plus') {
    return (<PlusOutlined />);
  } else if (p.type === 'tah') {
    return (<TagOutlined />)
  }
  return null;
}

/** action 配置规范, .action/.model 只需要配置一个，推荐配置 .model 更简洁(约定优于配置)。 */
export interface Action {
  // 原来的 key 不需要，因为直接绑定了 onAction，而 key 的作用就是这个
  // render actions array 的时候，item.key 设置为 item.onAction 这个稳定项
  // 因为 label 也可能是计算值
  /** 操作项文字 */
  label: string,
  /** 操作项执行任意函数，通常设定为 mst.action。
   *
   * 返回 Promise 代表直接异步执行，提交后台
   * 返回空代表任意同步执行，通常是跳转
   */
  action?: () => void,
  /** 按钮是否强制为可用的，没有对象选择也可以使用，适用于新建业务对象场景 */
  forceEnabled?: boolean,
  /** 操作所用的 MST 模型 */
  model?: { create: () => IActionModel },
  /** 是否失效，通常做成计算值，参考其他数据自动联动计算结果 */
  disabled?: boolean,
  /** 是否隐藏 */
  hidden?: boolean,
  /** 按钮前的图标，来自 iconfont 项目 */
  icon?: ReactNode,
  buttonType?: ButtonType,
  /** 配置按钮的 tooltip */
  tooltip?: () => ReactNode,
}

// type StateMapKey = Exclude<Action["model"] | Action["action"], undefined>;
interface IActionProps {
  loading: boolean,
  disabled: boolean,
  onTrigger: () => void,
}

/** 封装了点击各种形式操作按钮后的处理逻辑，目前供四类操作组封装组件使用 */
function getActionProps(
  stateMap: WeakMap<Action, IActionProps>,
  m: IObjectWithActionsModel,
  action: Action,
  /** 如果是外部提供操作对象的主标识，不写从列表模型中的 selected 取多选值 */
  objId?: number | string,
  /** 是否不依赖选择，比如新建类按钮 */
  noNeedSelection?: boolean,
  /** 本行对应 record */
  record?: Record,
) {
  // const key = action.model || action.action!;
  const key = action; // 以 action 为 key，因为 action 不是 observable
  const one = stateMap.get(key);
  if (!objId && !m.selected && !noNeedSelection) {
    alert('actions 操作组件要么配置 objId，要么模型中有 selected，要确保有操作对象！');
    return {} as IActionProps;
  }
  if (one) return one;
  // 对新的 action 第一次设置
  const state = observable({
    loading: false,
    setLoading(v: boolean) {
      state.loading = v;
    },
    get disabled(): boolean {
      // 只有配置 action.model 的操作，没选中会自动 disable
      if (action.forceEnabled) return false; // 按钮是否为强制可用的，不设置的话没有选中对象会被自动 disabled
      return (!objId && (m.selected?.length === 0 && !!action.model)) || action.disabled || state.loading;
    },
    onTrigger(): void {
      const selected = noNeedSelection ? undefined : (objId ? ([objId] as typeof m.selected) : m.selected);
      // todo: 针对列表中行内操作缺失提供 actionModel.execute 第二个参数的
      const selectedItems = noNeedSelection ? undefined : (objId ? (m.detail ? [m.detail] : [record]) : m.selectedItems);
      const result = (() => {
        if (action.model) {
          const actionModel = action.model.create();
          if (m.log) {
            m.log(actionModel);
          }
          if (actionModel) {
            // noNeedSelection 时，selected, selectedItems 为空
            return actionModel.execute!(selected!, selectedItems!); // 直接执行操作
          } else {
            alert('MST model 不符合 action model 规范');
          }
        } else if (action.action) {
          return action.action(); // 即可以直接执行操作，也可以返回视图生成函数
        } else {
          alert('action 必须配置成符合规范的 MST model 或者是 action 函数!');
        }
      })();
      // action 返回 promise 需要设置 button loading & disabled，得知完成自动刷新
      if (result instanceof Promise) {
        const as = result;
        state.setLoading(true);
        as.finally(() => {
          state.setLoading(false);
        });
        if (action.model) {
          as.then((didCanceled) => {
            // console.log(action.label, objId, didCanceled);
            // 在 Table columns 字段配置的 render 中使用 useContext 取到的是系统默认 context 而不是 Toolbar 提供的
            didCanceled || m.refresh();
          });
        }
      } else {
        // 执行如跳转等同步代码，无需做任何处理
      }
    }
  });

  stateMap.set(key, state)
  return state;
}

/** 适用于 toolbar 上的平铺按钮组 */
export const ActionButtons = observer((p: {
  /** 操作清单，哪些直接展示哪些在下拉 more 中展示支持自动策略或者配置
 * 有时候是 button 有时候是 a 链接，从使用者的角度，都是统一的按钮。
 * 因此统一成按钮，onAction 可以通过 js 代码方式执行和 a.href 一样的链接行为。
 */
  actions: Action[],
  /** 是否不依赖选择，比如新建类按钮 */
  noNeedSelection?: boolean,
}) => {
  const m = useContext(ListOrDetailModelContext) as IObjectWithActionsModel;;
  const actions = p.actions.filter(item => !item.hidden);
  const [stateMap] = useState(() => new WeakMap<Action, IActionProps>());
  const buttons = actions.map(action => {
    const { loading, disabled, onTrigger } = getActionProps(stateMap, m, action, undefined, p.noNeedSelection);
    const button = (
      <Button key={action.label} disabled={disabled} loading={loading} onClick={onTrigger} type={action.buttonType} className="action-btns-new">
        {/* {action.icon}{action.label} */}
        <Icon type={action.icon} />{action.label}
      </Button>
    );
    if (action.tooltip) {
      return (
        <Tooltip title={action.tooltip()} placement='bottom'>{button}</Tooltip>
      )
    } else {
      return button;
    }
  });
  // 注意：直接 return buttons 在使用本组件的地方会报 TS 错误
  return (<>{buttons}</>);
});

const styleActionButtonsOnRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateRows: '1fr',
  gridAutoColumns: 'auto',
  gridAutoFlow: 'column',
  gap: '8px',
  justifyContent: 'flex-start',
  alignContent: 'center',
  alignItems: 'center',
};

/** 适用于 table row 上的平铺按钮组 */
export const ActionButtonsOnRow = observer((p: {
  /** 操作清单，哪些直接展示哪些在下拉 more 中展示支持自动策略或者配置
 * 有时候是 button 有时候是 a 链接，从使用者的角度，都是统一的按钮。
 * 因此统一成按钮，onAction 可以通过 js 代码方式执行和 a.href 一样的链接行为。
 */
  actions: () => Action[],
  objId: number | string,
  record?: Record,
}) => {
  const m = useContext(ListOrDetailModelContext) as IObjectWithActionsModel;
  const [actions] = useState(() => p.actions().filter(item => !item.hidden));
  const [stateMap] = useState(() => new WeakMap<Action, IActionProps>());
  return (
    <div style={styleActionButtonsOnRow}>
      {actions.map(action => {
        const { loading, disabled, onTrigger } = getActionProps(stateMap, m, action, p.objId, undefined, p.record);
        const button = (
          <Button key={action.label} disabled={disabled} loading={loading} onClick={onTrigger} type={action.buttonType}>{action.icon}{action.label}</Button>
        );
        if (action.tooltip) {
          return (
            <Tooltip title={action.tooltip()} placement='bottom'>{button}</Tooltip>
          )
        } else {
          return button;
        }
      })}
    </div>
  );
});

/** 使用于 toolbar 上的下拉操作组 */
export const ActionDropMenu = observer((p: {
  label?: string,
  actions: Action[],
  /** 是否不依赖选择，比如新建类按钮 */
  noNeedSelection?: boolean,
}) => {
  const m = useContext(ListOrDetailModelContext) as IObjectWithActionsModel;;
  const actions = p.actions.filter(item => !item.hidden);
  const [stateMap] = useState(() => new WeakMap<Action, IActionProps>());
  const operationMenu = (
    <Menu mode="vertical" >
      {actions.map(action => {
        const { loading, disabled, onTrigger } = getActionProps(stateMap, m, action, undefined, p.noNeedSelection);
        return (
          <Menu.Item key={action.label} disabled={disabled} onClick={onTrigger} >
            {action.icon}
            {action.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
  return (
    <Dropdown overlay={operationMenu} className="action-drop-new">
      <Button className="action-btn" type="primary" >
        {p.label || '更多操作'} <Icon type="down" />
      </Button>
    </Dropdown>
  );
});


/** 使用于 detail 详情页上的下拉操作组 */
export const ActionDropMenuOnDetail = observer((p: {
  /** 风格，icon:就一个图标触发；text:文字“操作”连展开收起图标 */
  style?: 'icon' | 'text',
  actions: Action[],
}) => {
  const style = p.style || 'icon'; // 暂时都按 icon 风格支持
  const m = useContext(ListOrDetailModelContext) as IObjectWithActionsModel;;
  const actions = p.actions.filter(item => !item.hidden);
  const [stateMap] = useState(() => new WeakMap<Action, IActionProps>());
  const operationMenu = (
    <Menu mode="vertical" >
      {actions.map(action => {
        const { loading, disabled, onTrigger } = getActionProps(stateMap, m, action, m.id);
        return (
          <Menu.Item key={action.label} disabled={disabled} onClick={onTrigger} >
            {action.icon}
            {action.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
  return (
    <Dropdown overlay={operationMenu}>
      <div style={{ cursor: 'pointer' }}><Icon type="menu" /></div>
    </Dropdown>
  );
});

/** 适用于右键菜单的操作组 */
export const ActionDropMenuOnRow = observer((p: {
  label?: string,
  actions: () => Action[],
  objId: number | string,
  record?: Record,
}) => {
  const m = useContext(ListOrDetailModelContext) as IObjectWithActionsModel;
  const [actions] = useState(() => p.actions().filter(item => !item.hidden));
  const [stateMap] = useState(() => new WeakMap<Action, IActionProps>());
  const operationMenu = (
    <Menu mode="vertical" >
      {actions.map(action => {
        const { loading, disabled, onTrigger } = getActionProps(stateMap, m, action, p.objId, undefined, p.record);
        return (
          <Menu.Item key={action.label} disabled={disabled} onClick={onTrigger} >
            {action.icon}
            {action.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
  return (
    <Dropdown overlay={operationMenu} trigger={['contextMenu']}>
      <span> {p.label || ''} </span>
    </Dropdown>
  );
});
