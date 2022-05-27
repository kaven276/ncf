import { renderToStaticMarkup } from 'react-dom/server';
import { IMiddleWare, getConfig, createCtxItem } from '@ncf/microkernel';
import type { ComponentType } from 'react';
import { createElement } from 'react';

const configKey = Symbol('layout');

export interface ReactServerRenderConfig {
  /** Layout 模板指定 */
  Layout?: ComponentType,
}

const defaultConfig: ReactServerRenderConfig = {
}

export function setReactServerRenderConfig(cfg: ReactServerRenderConfig) {
  return {
    [configKey!]: cfg
  }
}

const DOCTYPE = '<!DOCTYPE html>';

/** 设置和获取服务端页面的 document title 的 get/set API */
export const ctxTitle = createCtxItem(Symbol('html title'));

/** 如果响应是 react 元素，则渲染成 html 字符串，返回转换完的响应  */
export const mwReactServerRender: IMiddleWare = async (ctx, next) => {
  await next();

  if ((typeof ctx.response === 'object') && (typeof ctx.response['$$typeof'] === 'symbol')) {
    const config: ReactServerRenderConfig = getConfig(configKey, ctx) || defaultConfig;
    let resp = ctx.response;
    if (config.Layout) {
      // 如果配置了 layout 则使用 layout
      resp = createElement(config.Layout, {}, ctx.response);
    }
    ctx.response = renderToStaticMarkup(resp);
    if (ctx.response.startsWith('<html ')) {
      ctx.response = DOCTYPE + ctx.response;
    }
  }
}
