import { createCfgItem, MiddleWareClass, type IMiddleWare } from '@ncf/microkernel';
import { setTimeout } from 'node:timers/promises';

/** 是否在响应中添加额外的信息，中间件集成目录配置类型 */
export const cfgExtraResp = createCfgItem<boolean>(Symbol('extra'), false);

/** 如果中间件需要支持目录开关的话 */
export const cfgSwitch = createCfgItem<boolean>(Symbol('switch'), false);

/** 允许应用使用特定的而非默认的类实例，拥有不同的实例配置 */
export class MiddlwareClass implements MiddleWareClass {

  constructor(
    /** 中间件内置配置类型，一个类实例统一配置 */
    public delay: number
  ) { };

  /** 示范允许使用中调整配置 */
  setDelay(delay: number) {
    this.delay = delay;
  }

  /** 最终挂接到 ncf 的中间件函数 */
  middleware: IMiddleWare = async (ctx, next) => {
    if (cfgSwitch.get(ctx) === false) {
      await next();
      return;
    }
    const delay = this.delay;
    if (delay && delay > 0) {
      await setTimeout(delay);
    }
    await next();

    if (cfgExtraResp.get1(ctx)) {
      try {
        ctx.response.$extra = { delay };
      } catch (e) { }
    }
  };

}

export const mwInstance = new MiddlwareClass(0);
