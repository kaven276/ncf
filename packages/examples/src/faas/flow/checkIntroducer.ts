import { Service, bindFlow } from '@ncf/microkernel';

interface Request {
  /** 申请流程实例号 */
  applyId: string,
  /** 推荐人账号 */
  introducer: string,
}

interface Response {
  /** 流程实例ID */
  passed: boolean,
}

interface Api {
  path: '/flow/checkIntroducer',
  request: Request,
  response: Response,
}

/** 核实作为现有账户的引荐人是否是他引荐注册的 */
export const faas: Service<Api> = async (req) => {
  return {
    passed: (req.introducer === 'LiYong'),
  }
}

/** 获取流程实例ID */
bindFlow<Api>(module, (ctx) => {
  return {
    flowInstId: ctx.request.applyId
  };
});
