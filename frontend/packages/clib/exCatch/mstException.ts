import { ErrorInfo, SaveErrorInfo } from './index';

/**
 * 使用 mst 中间件统计错误信息
 * 暂时只保存最后一次报错信息，不进行堆栈保存。
 */

export const mstException = (call: { type: any; args: any[]; parentEvent: any; }, next: (arg0: any) => void, abort: any) => {
  switch (call.type) {
    case "flow_throw": {
      const error = call.args[0]
      const Info = {
        "type": 'mst',
        "message": error,
        "state":JSON.stringify(call.parentEvent||{})
      } as ErrorInfo
      SaveErrorInfo(Info);
    }
    default:
      next(call)
      break;
  }
}
