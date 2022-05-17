import { IAnyStateTreeNode, getPathParts } from "mobx-state-tree"

/** 获取子模型在 MST array 中的下标 */
export function getIndex(node: IAnyStateTreeNode) {
  return +getPathParts(node).slice(-1)[0];
}
