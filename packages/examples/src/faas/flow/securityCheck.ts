/** 安全审核，如果审核通过，流程结束，不通过的话，流程作废，并通知申请人 */

import { Service, bindFlow } from '@ncf/microkernel';

interface Request {
  /** 申请流程实例号 */
  applyId: string,
  /** 检查人账号 */
  checker: string,
}

interface Api {
  path: '/flow/securityCheck',
  request: Request,
  response: void,
}

/** 通知管理员去安全审核新账户申请 */
export const faas: Service<Api> = async (req) => {
  return;
}

/** 获取流程实例ID */
bindFlow<Api>(module, (ctx) => {
  return {
    flowInstId: ctx.request.applyId
  };
});
