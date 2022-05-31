import { throwServiceError, type IMiddleWare } from '@ncf/microkernel';
import { ifUserHasRole } from 'src/faas/4A/ifUserHasRole';

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
    // console.dir(ctx.caller);
    const user = ctx.caller.user;
    if (!user) {
      throwServiceError(403, '无登录用户，无法确定角色');
    }
    // console.log(!ifUserHasRole(user, faasRole));
    const passed = await ifUserHasRole(user, faasRole);
    if (!passed) {
      throwServiceError(403, `当前用户${user}，没有要求的角色 ${faasRole}`);
    }
  }
  await next();
}
