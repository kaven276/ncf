import { applySnapshot, getSnapshot, IStateTreeNode, IType } from 'mobx-state-tree';

/**
    Save / Restore the state of the store while self module is hot reloaded
*/
export function mstHMR(module: any, store: IStateTreeNode<IType<any, any, any>>) {
  if (module.hot) {
    if (module.hot.data && module.hot.data.store) {
      applySnapshot(store, module.hot.data.store)
    }
    module.hot.dispose((data: any) => {
      data.store = getSnapshot(store)
    })
  }
}

