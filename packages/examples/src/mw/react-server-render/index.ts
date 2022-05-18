import { renderToStaticMarkup } from 'react-dom/server';
import { IMiddleWare } from '@ncf/microkernel';

/** 延迟开始执行不超过任意毫秒数  */
export const mwReactServerRender: IMiddleWare = async (ctx, next) => {
  await next();

  if ((typeof ctx.response === 'object') && (typeof ctx.response['$$typeof'] === 'symbol')) {
    ctx.response = renderToStaticMarkup(ctx.response)
  }
}
