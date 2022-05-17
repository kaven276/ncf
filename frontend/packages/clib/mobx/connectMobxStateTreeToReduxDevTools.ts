import { envType } from 'clib/env';
import Debug from 'debug';
import Moment from 'moment';
import { IStateTreeNode } from 'mobx-state-tree';
import { connectReduxDevtools } from "mst-middlewares";

const debug = Debug(module.id);

declare global {
  interface Window {
    /** 当前正在使用的路由对应的 MST 模型实例引用 */
    cm?: IStateTreeNode,
    __REDUX_DEVTOOLS_EXTENSION__: {
      connect: Function,
      disconnect: Function,
    }
  }
}

/** 是否忽略 devtool 支持 */
const ignore = (() => {
  if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
    return true; // 没安装 devtool 浏览器插件就忽略 devtool 支持
  }
  /** 如果设置则强制打开或者关闭 devtool 集成 */
  const useReduxDevTool = window.localStorage.getItem('useReduxDevTool') as ('true' | 'false' | null);
  if (useReduxDevTool === 'true') { // 强制打开
    return false;
  } else if (useReduxDevTool === 'false') { // 强制关闭
    return true;
  } else { // 智能判断
    return (envType === 'prod' || envType === 'test'); // 只有本地开发人员调试才连接 redux devtool
  }
})();

const SessionNameId = 'MstDevToolSessionName';
// 每个窗口增加唯一标识，取自窗口第一次加载本代码的时间，用于在 devtools 中区分哪个条目是来自哪个窗口
let sessionName = window.sessionStorage.getItem(SessionNameId)!;
if (!ignore && !sessionName) {
  let LSID = Number(window.localStorage.getItem(SessionNameId) || '0');
  sessionName = String(1 + LSID);
  window.localStorage.setItem(SessionNameId, sessionName)
  window.sessionStorage.setItem(SessionNameId, sessionName);
}

if (!ignore) {
  debug(document.title);
  if (!document.title.match(/^\d+\)/)) {
    document.title = `${sessionName}) ${document.title}`;
  }
}

// 模仿 remotedev 的功能，但是因为不走远程，走本页面自带的浏览器 redux devtool extension，所以删除/注释引用
// import remotedev from "remotedev"; // no types on its own or @types/xxx
// const remotedev = require("remotedev");
// import { stringify, parse } from 'jsan'; // 目前没用，直接使用的 json
const remotedev = {
  connectViaExtension: (options: {
    /** 显示在 redux devtools 上的条目名称，来自 MST 模型名称，加上其他 context 信息 */
    name: string,
  }) => {
    debug('connectViaExtension', options);
    const time = Moment().format('YYYY.MM.DD HH:mm:ss');
    const loc = window.location.href;
    return window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
      ...options,
      name: `[ ${time} ] ${options.name} at ${loc} (${sessionName})`,
    });
  },
  extractState: (message: { state: object }) => {
    if (!message || !message.state) return undefined;
    if (typeof message.state === 'string') return JSON.parse(message.state);
    return message.state;
  }
}

/** 防止同一个 MST 模型实例连接多次 devtool */
const memo = new Set();

function connectMobxStateTreeToReduxDevTools(mst: any) {
  if (ignore) return;
  if (memo.has(mst)) {
    return; // 已经连接到 redux devTools 上了
  }
  memo.add(mst);
  connectReduxDevtools(remotedev, mst);
}

function disconnectMobxStateTreeFromReduxDevTools(mst: any) {
  // 其实执行下面语句就会将全部连接到 devtools 的对象全部断开，包括 dva 的，所以干错不退出了，等待页面退出再一并退出
  // 页面会保持各个版本的也就是通过反复路由往复造成的模型实例共存
  // window.__REDUX_DEVTOOLS_EXTENSION__?.disconnect();
  memo.delete(mst);
}

export { connectMobxStateTreeToReduxDevTools, disconnectMobxStateTreeFromReduxDevTools };
export { connectMobxStateTreeToReduxDevTools as mstToReduxDevTools };

// 卸载窗口后关闭
window.addEventListener('unload', () => {
  window.__REDUX_DEVTOOLS_EXTENSION__?.disconnect();
});

