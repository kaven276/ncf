import { renderToStaticMarkup } from 'react-dom/server';
import { IMiddleWare, createCtxItem, createCfgItem } from '@ncf/microkernel';
import { createElement } from 'react';

/** react 页面的框架类型，包裹 faas 返回的 html */
export type Layout = (props: { children: JSX.Element }) => JSX.Element;

/** react page layout 的目录配置项 */
export const cfgLayout = createCfgItem<Layout>(Symbol('layout'));

/** 设置和获取服务端页面的 document title 的 get/set API */
export const ctxTitle = createCtxItem<string>(Symbol('html title'));

const DOCTYPE = '<!DOCTYPE html>';

/** 如果响应是 react 元素，则渲染成 html 字符串，返回转换完的响应  */
export const mwReactServerRender: IMiddleWare = async (ctx, next) => {
  await next();

  const isResponseReactElement = (typeof ctx.response === 'object') && (typeof ctx.response['$$typeof'] === 'symbol');

  if (isResponseReactElement) {
    const layout = cfgLayout.get(ctx);
    let resp = ctx.response;
    if (layout) {
      // 如果配置了 layout 则使用 layout
      resp = createElement(layout, { children: ctx.response });
    }
    ctx.response = renderToStaticMarkup(resp);
    if (ctx.response.startsWith('<html ')) {
      ctx.response = DOCTYPE + ctx.response;
    }
  }
}
