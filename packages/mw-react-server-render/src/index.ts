import { renderToStaticMarkup } from 'react-dom/server';
import { IMiddleWare, createCtxItem, createCfgItem } from '@ncf/microkernel';
import { createElement, type ReactElement } from 'react';
import { Helmet } from 'react-helmet';
export { addLoader } from './ssr-loader';

export { Helmet };

/** react 页面的框架类型，包裹 faas 返回的 html */
export type Layout = (props: { children: JSX.Element }) => JSX.Element;

/** react page layout 的目录配置项，一般只配置 body 里面的内容即可，html/head/body 由 react-helmet 支持 */
export const cfgLayout = createCfgItem<Layout>(Symbol('layout'));

/** 设置和获取服务端页面的 document title 的 get/set API */
export const ctxTitle = createCtxItem<string>(Symbol('html title'));

const DOCTYPE = '<!DOCTYPE html>';

/** 如果响应是 react 元素，则渲染成 html 字符串，返回转换完的响应  */
export const mwReactServerRender: IMiddleWare = async (ctx, next) => {
  await next();

  const isResponseReactElement = (typeof ctx.response === 'object') && (typeof ctx.response['$$typeof'] === 'symbol');
  // console.dir(ctx.response, { depth: 10 });
  if (isResponseReactElement) {
    const layout = cfgLayout.get(ctx);
    let resp: ReactElement = ctx.response;
    if (layout) {
      // 如果配置了 layout 则使用 layout
      resp = createElement(layout, { children: ctx.response });
    }
    ctx.response = renderToStaticMarkup(resp);
    // console.dir(ctx.response);
    if (ctx.response.startsWith('<html ')) {
      ctx.response = DOCTYPE + ctx.response;
    } else {
      // 不是 <html 开头的输出，需要补上 helmet
      const helmet = Helmet.renderStatic();
      ctx.response = `
      ${DOCTYPE}
      <html ${helmet.htmlAttributes.toString()}>
        ${helmet.base.toString()}
        ${helmet.meta.toString()}
        ${helmet.title.toString()}
        ${helmet.link.toString()}
        ${helmet.style.toString()}
      <body ${helmet.bodyAttributes.toString()}>
        ${ctx.response}
      </body>
      ${helmet.script.toString()}
      </html>
      `;
    }
  }
}

/** 将服务端的js转入client */
export function toClientScript(fn: () => void) {
  return createElement('script', undefined, `(${fn.toString()})()`);
}
