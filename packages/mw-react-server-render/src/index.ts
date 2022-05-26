import { renderToStaticMarkup } from 'react-dom/server';
import { IMiddleWare, getConfig } from '@ncf/microkernel';
import type { ComponentType } from 'react';
import { createElement } from 'react';

const configKey = Symbol('layout');

export interface ReactServerRenderConfig {
  /** Layout 模板指定 */
  Layout?: ComponentType,
  /** 页面标题 */
  title?: string,
}

const defaultConfig: ReactServerRenderConfig = {
}

export function setReactServerRenderConfig(cfg: ReactServerRenderConfig) {
  return {
    [configKey!]: cfg
  }
}

/** 如果响应是 react 元素，则渲染成 html 字符串，返回转换完的响应  */
export const mwReactServerRender: IMiddleWare = async (ctx, next) => {
  await next();

  if ((typeof ctx.response === 'object') && (typeof ctx.response['$$typeof'] === 'symbol')) {
    const config: ReactServerRenderConfig = getConfig(configKey, ctx) || defaultConfig;
    if (config.Layout) {
      // 如果配置了 layout 则使用 layout
      //@ts-ignore
      ctx.response = renderToStaticMarkup(createElement(config.Layout, { head: { title: config.title } }, ctx.response));
    } else {
      ctx.response = renderToStaticMarkup(ctx.response);
    }
  }
}
