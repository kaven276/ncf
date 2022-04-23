import { Service, bindFlow } from '@ncf/microkernel';

let applicationSerial = 0;

interface Request {
  username: string,
  password: string,
  /** 身份证号 */
  idcode: string,
  city?: string,
  age?: number,
  /** 推荐人账号 */
  introducer: string,
}

interface Response {
  /** 流程实例ID */
  wfid: number,
}

interface Api {
  path: '/flow/applyNewAccount',
  request: Request,
  response: Response,
}

/** 申请新账号，需录入基本信息和引荐人账号 */
export const faas: Service<Api> = async (req) => {
  applicationSerial += 1;
  return {
    wfid: applicationSerial,
  } as Response;
}

/** 获取流程实例ID */
bindFlow<Api>(module, (ctx) => {
  return {
    create: true,
    flowInstId: String(ctx.response.wfid),
  };
});
