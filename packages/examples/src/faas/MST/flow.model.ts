import { Instance, types } from 'mobx-state-tree';

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
export let hwFlowInst = 0;
