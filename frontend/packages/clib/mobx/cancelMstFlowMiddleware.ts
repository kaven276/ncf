import { addMiddleware, IStateTreeNode } from 'mobx-state-tree';

/** 对模型实例应用本中间件，将阻止新的 action 实际执行，并挂起在途中的 flow 从 yield 返回后继续往下执行 */
export function cancelMstFlow(m: IStateTreeNode) {
  return addMiddleware(m, (call, next, abort) => {
    // console.log('call', call);
    if (call.type === 'action') {
      // 不用再允许执行新的 action
      // return; // 对于 type:action 必须调用 next 或 abort
      // mobx-state-tree.module.js:3862 Uncaught Error: [mobx-state-tree]
      // Neither the next() nor the abort() callback within the middleware
      // for the action: "doFlow" on the node: Model was invoked.
      return abort(null);
    } else if (call.type === 'flow_resume') {
      // 对于执行中 flow yield 返回，不进行进一步处理，pending 住，可能会造成 generator 内存不能释放
      return;
    } else if (call.type === 'flow_throw') {
      // 直接返回汇报异常，所以做 abort 处理
      return abort(null);
    } else {
      // console.warn(`mst instance is destroyed, do not call it'action`);
    }
  });
}
