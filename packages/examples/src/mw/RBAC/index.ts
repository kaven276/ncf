import { throwServiceError, type IMiddleWare } from '@ncf/microkernel';

declare module '@ncf/microkernel' {
  interface IFaasModule {
    /** 允许执行本 faas 的角色 */
    role?: string;
  }
}

/** 从环境获取 version tag，仅仅作为参照实现 */
export const mwRBAC: IMiddleWare = async (ctx, next) => {
  const faasRole = ctx.fassModule.role;
  if (faasRole) {
    console.dir(ctx.caller);
    const user = ctx.caller.user;
    if (!user) {
      throwServiceError(403, '无登录用户，无法确定角色');
    }
    const callerRole = user; // 暂时先将当前用户等同于其角色，日后再扩展
    if (callerRole !== faasRole) {
      throwServiceError(403, `当前角色${callerRole}，要求的角色 ${faasRole}`);
    }
  }
  await next();
}
