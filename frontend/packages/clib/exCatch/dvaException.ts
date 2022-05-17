import { SaveErrorInfo, ErrorInfo } from './index';
/**
 * 统计dva异常
 */

export const dvaException = (error:any,state: any) => {
  const Info = {
    "type": "dva",
    "message": error.message,
    "stack": error.stack,
    "state":JSON.stringify(state)
  } as ErrorInfo
  console.log("dvaError ：", Info);
  SaveErrorInfo(Info);
}