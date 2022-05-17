import { IMiddlewareEvent, IAnyStateTreeNode, addMiddleware } from "mobx-state-tree";
import { observable } from 'mobx';
// import { reaction } from 'mobx';

type DateNumber = ReturnType<typeof Date.now>;

/** 跟踪全部 MST flow 执行中 */
export const loadings = observable({
  /** key=flowAction 跟踪最近执行中时间戳，没在执行为 undefined */
  d: new Map<Function, DateNumber>(),
  enter(action: Function) {
    this.d.set(action, Date.now());
  },
  quit(action: Function) {
    this.d.delete(action);
  },
  loading(action: Function) {
    return this.d.get(action);
  },
  /** key=flowAction 跟踪最近执行成功完成时间戳，从未执行成功(含未执行或第一次执行进行中)为 undefined */
  o: new Map<Function, DateNumber>(),
  /** flow action 最后一次执行成功的时间，用于判断是否初始化 flow 是否完成，具备首次渲染条件。 */
  complete(action: Function) {
    this.o.set(action, Date.now())
  },
  onceLoaded(action: Function) {
    return this.o.get(action);
  }
});

/** 判断指定 flow 是否在执行中状态 */
export function isFlowLoading(action: Function) {
  return loadings.loading(action);
}

/** flow 是否至少成功执行完一次，方便判断是否可以做首次渲染 */
export function isFlowOnceLoaded(action: Function) {
  return loadings.onceLoaded(action);
}

// reaction(() => loadings.d.size, () => {
//   console.log('loading count =', loadings.d.size);
// });

// 测试 call.context[call.parentEvent!.name] 是否是 model.action 用
// let action2: any;
// export const setAction = (a: any) => action2 = a;

/**
 * 跟踪 MST flow 是否正在执行的中间件
 */
export const trackFlowLoadingMiddleware: Parameters<typeof addMiddleware>[1] =
  (call: IMiddlewareEvent, next: (call: IMiddlewareEvent) => void, abort) => {

    const skip =
      call.type === "action" ||
      call.type === "flow_resume" ||
      call.type === "flow_resume_error";
    if (skip) {
      return next(call);
    }

    const action = call.context[call.parentEvent!.name]; // 调用的 MST 实例的 action 函数本身
    // console.log(`action ${call.name} was invoked`, call);

    if (call.type === 'flow_spawn') {
      if (loadings.loading(action)) {
        return abort({ overlap: true });
      }
      loadings.enter(action);
    } else if (call.type === 'flow_return') {
      loadings.quit(action);
      loadings.complete(action);
    } else if (call.type === 'flow_throw') {
      loadings.quit(action);
    }

    next(call);
  }

/** 设定跟踪指定 MST 实例 flow loading 和最后一次 loaded 时间，结果在 loadings 中订阅查看 */
export function trackFlowLoading(mst: IAnyStateTreeNode) {
  addMiddleware(mst, trackFlowLoadingMiddleware);
}
