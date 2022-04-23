// 开户审批流程
import { waitFlowStart, getDebug } from '@ncf/microkernel';
import { faas as applyNewAccount } from 'src/faas/flow/applyNewAccount';
import { faas as checkIntroducer } from 'src/faas/flow/checkIntroducer';
import { faas as notifyAdministrator } from 'src/faas/flow/notifyAdministrator';
import { faas as securityCheck } from 'src/faas/flow/securityCheck';

const debug = getDebug(module);

waitFlowStart(module, applyNewAccount, async (startCtx, flowInstId, waitFaas, callFaas) => {
  debug(startCtx);
  const applyId = flowInstId as string;
  const { request: { introducer } } = await waitFaas(checkIntroducer);
  debug(`introducer: ${introducer} passed, flow go next step`);
  await callFaas(notifyAdministrator, { applyId }); // 支持流程日志，支持流程函数退出重进恢复
  // await notifyAdministrator({ applyId }); // 改成使用 callFaas 替代直接调用
  const { request: { checker } } = await waitFaas(securityCheck);
  debug(`checker: ${checker} passed, flow go next step`);
});
