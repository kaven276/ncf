import { setModal } from 'clib/ooui/oper';
import { isValidElement, ReactElement } from 'react';

type TViewCreator<T extends any> = (cb: (result: T | Error) => void) => (JSX.Element | null | any);

/** 向导式界面支持，可用于 flow 中要求用户操作 */
export async function wait<T>(viewCreator: TViewCreator<T>) {


  return new Promise<T>((resolve, reject) => {
    let disposer: undefined | (() => void);
    let modal: ReactElement | undefined;
    // 调用 callback 来结束
    function cb(returnValue: T | Error) {
      disposer?.();
      if (modal) {
        setModal(null);
      }
      if (returnValue instanceof Error) {
        reject(returnValue);
      } else {
        resolve(returnValue);
      }
    }
    const result = viewCreator(cb);
    if (isValidElement(result)) {
      // 如果返回的是 react Element 视图，则展示
      modal = result;
      setModal(modal);
    } else if (typeof result === 'function') {
      // 如果返回的是函数，认为就是 disposer 函数，执行 cb 时带上执行销毁
      disposer = result;
    }
    // TViewCreator 其实也可以是其他的
  });
}

import React from 'react';
window.React = React;
