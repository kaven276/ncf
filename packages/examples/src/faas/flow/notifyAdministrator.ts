import { Service, bindFlow } from '@ncf/microkernel';

interface Request {
  /** 申请流程实例号 */
  applyId: string,
}

interface Api {
  path: '/flow/notifyAdministrator',
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
