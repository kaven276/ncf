import { flowInstances, Flow } from './flow.model';
import { Service } from '@ncf/microkernel';
import type { NewFlow } from './flow.spec';
import { getSnapshot } from 'mobx-state-tree';

export const faas: Service<NewFlow> = async () => {
  const flowInst = flowInstances.size + 1;
  const inst = Flow.create({ flowInst });
  flowInstances.set(flowInst, inst);
  return getSnapshot(inst);
}
