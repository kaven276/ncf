import { renderToStaticMarkup } from 'react-dom/server';
import { IMiddleWare } from '@ncf/microkernel';

/** 如果响应是 react 元素，则渲染成 html 字符串，返回转换完的响应  */
export const mwReactServerRender: IMiddleWare = async (ctx, next) => {
  await next();

  if ((typeof ctx.response === 'object') && (typeof ctx.response['$$typeof'] === 'symbol')) {
    ctx.response = renderToStaticMarkup(ctx.response)
  }
}
