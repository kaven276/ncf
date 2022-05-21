import { getFlowInst } from './flow.model';
import { Service } from '@ncf/microkernel';
import type { QueryFlow } from './flow.spec';
import { getSnapshot } from 'mobx-state-tree';

export const faas: Service<QueryFlow> = async (req) => {
  const inst = await getFlowInst(req.flowInst ?? 1)!;
  return getSnapshot(inst);
}
