import { flowInstances, Flow } from './flow.model';
import { Service } from '@ncf/microkernel';
import type { ApproveFlow } from './flow.spec';
import { getSnapshot } from 'mobx-state-tree';

export const faas: Service<ApproveFlow> = async (req) => {
  const inst = flowInstances.get(req.flowInst ?? 1)!;
  inst?.progress();
  return getSnapshot(inst);
}
