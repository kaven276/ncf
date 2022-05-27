import { renderToStaticMarkup } from 'react-dom/server';
import { IMiddleWare, getConfig, getCallState } from '@ncf/microkernel';
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

const TitleKey = Symbol('html title');

/** 服务调用期间的全部内容 */
declare module '@ncf/microkernel' {
  interface ICallState {
    // 使用 Symbol 作为本功能模块在调用线程数据结构中的 key，防止其他第三方中间件 key 命名重复造成 bug
    [TitleKey]?: string,
  }
}

/** 设置 react 页面的 document title，需要 layout 支持 */
export function setTitle(title: string) {
  const als = getCallState();
  als[TitleKey] = title;
}

/** 获取 react 页面的 document title, 一般 layout 中使用 */
export function getTitle(): string | undefined {
  const als = getCallState();
  return als[TitleKey];
}
