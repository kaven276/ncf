import { useState, useEffect } from 'react';
import { reaction } from 'mobx';

/** 用于将任意 mobx 数据进行 hook 监听获取，如同 react-redux 的 useSelector */
export function useMobxSelector<T>(fn: () => T, deps: any[] = []) {
  const [value, setValue] = useState<T>(() => fn());
  const [firstDep] = useState(() => deps);
  // 第一次因为 useState 和 useEffect 中 reaction 各自调用 fn 存在时差，
  // 中间 fn 结果可能变了，导致 reaction 检测不到变化，因此补上一个立即 fire
  useEffect(() => reaction(fn, setValue, { fireImmediately: deps === firstDep }), deps);
  return value;
}
