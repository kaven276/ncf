import { IMiddleWare, throwServiceError } from '@ncf/microkernel';


/** lazy 方式提供中间件清单，确保所有带 resolved 声明周期的依赖模块已经 ready 后再执行j */
export const middlewares = () => {

  return [
    async (ctx, next) => {
      // 如果是带身份自动测试的话，fake 出调用者身份，否则注释掉
      if (!ctx.path.startsWith('/typeorm')) {
        throwServiceError(404, '访问不存在路径！');
      }
      await next();
    },

  ] as IMiddleWare[];
}
