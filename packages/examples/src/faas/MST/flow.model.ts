import { addDisposer } from '@ncf/microkernel';
import { getSnapshot, Instance, types } from 'mobx-state-tree';
import { readFile, writeFile } from 'node:fs/promises';

/** 当前模型 */
export const Flow = types.model('Flow', {
  flowInst: 0,
  name: '审批',
  step: 0,
  isFinished: false,
}).extend(self => {
  return {
    actions: {
      progress() {
        if (self.isFinished) {
          return;
        }
        self.step += 1;
        if (self.step === 3) {
          self.isFinished = true;
        }
      },
      regress() {
        if (self.isFinished) {
          return;
        }
        self.step -= 1;
      },
    },
  }
});

export const flowInstances = new Map<number, Instance<typeof Flow>>();

export async function getFlowInst(id: number): Promise<Instance<typeof Flow>> {
  let inst = flowInstances.get(id);
  if (!inst) {
    // 从文件恢复
    const snapshot = await readFile(`./db/MstFlow/flow_${id}.json`, { encoding: 'utf8' });
    inst = Flow.create(JSON.parse(snapshot));
    flowInstances.set(id, inst);
  }
  return inst;
}

function save() {
  for (let inst of flowInstances.values()) {
    writeFile(`./db/MstFlow/flow_${inst.flowInst}.json`, JSON.stringify(getSnapshot(inst)), { encoding: 'utf8' });
  }
}

addDisposer(save);
