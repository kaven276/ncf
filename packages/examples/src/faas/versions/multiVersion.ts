// 本模块同时支持多个灰度标签
import type { Service } from '@ncf/microkernel';
import { getVerionTag, Tag } from 'src/mw/versions';

interface IResponse {
  layout: string,
  color: string,
  vt?: Tag,
  pushed?: boolean,
}

interface Api {
  path: '/versions/multiVersion',
  request: undefined,
  response: IResponse,
}

/** 演示根据请求中标识的版本要求做相应的特殊处理 */
export const faas: Service<Api> = async () => {
  const vt = getVerionTag();
  let res: IResponse;
  if (vt === 'dark-theme') {
    res = {
      layout: 'normal',
      color: 'black',
    }
  } else if (vt === 'new-layout') {
    res = {
      layout: 'new',
      color: 'light',
    }
  } else {
    res = {
      layout: 'normal',
      color: 'light',
    }
  }
  if (vt === 'order-push') {
    res.pushed = true;
  }
  res.vt = vt;
  return res;
}
