// work flow 工作流支持

import { Service, FaasPath, IApi } from './lib/faas';
import { ICallState } from './lib/callState';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getDebug } from './util/debug';
import { ProjectDir } from './util/resolve';
import { registerDep } from './hotUpdate';
import { innerCall } from './innerCall';

const debug = getDebug(module);

interface FlowStepInfo {
  /** 是否是创建新流程实例的第一步 */
  create?: true,
  /** 所属的流程类型的流程执行实例标识，决定路由到哪个 flow async 函数 */
  flowInstId: number | string,
  /** 属于哪个流程空间; 一个 flow 可能会跨多个 FAAS 域/命名空间 */
  flowNamespace?: string,
  /** 属于哪个 flow 类型，为 src/flow 下的 flow 模块路径 */
  flowTypePath?: string,
}

declare module './lib/faas' {
  export interface IFaasModule<T> {
    /** 确定对应的流程的实例 id */
    deriveFlowInfo?: (call: T) => FlowStepInfo,
  }
}

/** 设置 faas 模块如何提取所处流程的信息 */
export function bindFlow<T extends IApi = IApi>(
  flowModule: NodeModule,
  deriveFlowInfo?: (call: T) => FlowStepInfo) {
  flowModule.exports.deriveFlowInfo = deriveFlowInfo;
}

type WithFlow<T extends IApi> = T & { flowStepInfo: FlowStepInfo };
type FlowInstanceId = string | number;
type WaitMap<T extends IApi = IApi> = Map<FlowInstanceId | undefined, (ctx: WithFlow<T>) => void>;
/** 所有登记等待的回调 */
const waitRegistry = new Map<FaasPath, WaitMap>();


interface FlowState {
  flowInstId: FlowInstanceId,
}
const asyncLocalStorage = new AsyncLocalStorage<FlowState>();

/** 从一个 flow async function 中获取当前的流程执行实例号 */
function getFlowInstanceId(): FlowInstanceId {
  return asyncLocalStorage.getStore()!.flowInstId;
}


/** executor 调用。 如果当前执行的 faas 有 export deriveFlowInfo 则做流程推进消息通知，从等待注册表中找到注册的回调去执行 */
export function notifyWaiter(ctx: ICallState): void {
  // debug('notifyWaiter enter', ctx.path, ctx.fassModule.deriveFlowInfo);
  const { deriveFlowInfo } = ctx.fassModule;
  if (!deriveFlowInfo) return;

  const waitForOneFaas = waitRegistry.get(ctx.path);
  if (!waitForOneFaas) {
    debug(`no waiter for ${ctx.path}`);
    return;
  };
  const derivedFlowInfo = deriveFlowInfo(ctx);
  const cb = waitForOneFaas.get(derivedFlowInfo.create ? undefined : derivedFlowInfo.flowInstId);
  if (!cb) {
    debug(`no waiter for ${ctx.path}`, derivedFlowInfo);
    return;
  }
  debug('notify', ctx.path);
  cb({ path: ctx.path, request: ctx.request, response: ctx.response, flowStepInfo: derivedFlowInfo });
}



/** 等待指定 faas 路径针对指定流程实例的执行，注册 waiter cb 到等待注册表 */
function registerWaitForFaas<T extends IApi = IApi>(path: T["path"], flowInstanceId: FlowInstanceId | undefined, cb: (ctx: WithFlow<T>) => void) {
  let waitForOneFaas = waitRegistry.get(path);
  if (!waitForOneFaas) {
    waitForOneFaas = new Map();
    waitRegistry.set(path, waitForOneFaas);
  }
  //@ts-ignore
  waitForOneFaas.set(flowInstanceId, cb);
  debug('registered', path, flowInstanceId);
}

/** 等待指定 faasPath 的服务执行完，返回该 faas 执行上下文，包括请求响应内容 */
async function waitFaas<T extends IApi>(faas: Service<T>): Promise<T> {
  return new Promise(resolve => {
    debug(`waitFaas ${faas.faasPath!} ${getFlowInstanceId()}`)
    registerWaitForFaas(faas.faasPath!, getFlowInstanceId(), (ctx: T) => {
      resolve(ctx);
    });
  });
}

type WaitFaas = typeof waitFaas;

/** 在流程执行过程中，用来调用其他 faas */
export function callFaas<T extends IApi = IApi>(faas: Service<T>, request: T["request"]): Promise<T["response"]> {
  debug(`call ${faas.faasPath}`, request);
  return innerCall({ faasPath: faas.faasPath! }, request);
}

type CallFaas = typeof callFaas;

/** 等待指定 faasPath 的服务执行完，开启新的流程 */
export async function waitFlowStart<T extends IApi>(
  flowModule: NodeModule,
  faas: Service<T>,
  flow: (startCtx: WithFlow<T>, flowInstanceId: FlowInstanceId, waitFaas: WaitFaas, callFaas: CallFaas) => Promise<void>
) {
  await registerDep(flowModule.filename);
  debug('waitFlowStart', faas.faasPath);
  registerWaitForFaas(faas.faasPath!, undefined, async (ctx: WithFlow<T>) => {
    const { flowInstId } = ctx.flowStepInfo;
    const flowState: FlowState = {
      flowInstId,
    }
    const resp = asyncLocalStorage.run(flowState, async () => {
      const flowPath = flowModule.filename.substring(ProjectDir.length);
      flow(ctx, flowInstId, waitFaas, callFaas)
        .then(() => {
          debug(`${flowPath}:${flowInstId} finished`);
        })
        .catch(e => {
          debug(`${flowPath}:${flowInstId} failed`);
          debug(e);
        })
    });
  });
}



interface DrivingFaasMessage {
  /** faas 消息类型，0驱动新创建流程实例，1中间环节faas执行信息 */
  type: 0 | 1,
  /** 对应的 flow 的标识路径，用于匹配该消息发往哪种流程 */
  wfpath: string,
  /** work flow instance id，用于匹配该消息发往上面类型流程的那个流程执行实例；如果订单流程就是订单号  */
  wfid: 3,
  faas: {
    path: string,
    request: any,
    response: any
  }
}

const DrivingFaasMessageQueue: DrivingFaasMessage[] = [];
