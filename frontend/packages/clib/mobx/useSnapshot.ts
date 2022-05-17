import { onSnapshot, IStateTreeNode, getSnapshot, getMembers, getRoot, getPath, SnapshotOut } from 'mobx-state-tree';
import { useEffect, useState, useDebugValue } from 'react';

/** 当跟踪的 MST 实例发生变化时，强制刷新组件。
 * 用于强制非 mobx observer 的组件能通过传统 react 自上而下 props 传递方式得到刷新
 * react devtool 中可以看到是哪个模型的哪个路径的 snapshot
 */
export function useSnapshot<T extends IStateTreeNode>(m: T): SnapshotOut<T> {
  let debugLabel;
  try {
    // 文件分块断点续传上传模块中发现异常
    debugLabel = getMembers(getRoot(m)).name + ':' + getPath(m);
  } catch (e) {
    debugLabel = 'unresolved';
  }
  useDebugValue(debugLabel);
  const [snapshot, setSnapshot] = useState(() => getSnapshot(m));
  useEffect(() => onSnapshot(m, setSnapshot), [m]);
  return snapshot;
}
