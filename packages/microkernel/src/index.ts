import { jsExt } from './util/resolve';
if (!process.env.DEBUG && jsExt === '.ts') {
  process.env.DEBUG = '*';
}

export type { IApi, IFaasModule, Service } from './lib/faas';
export type { IConfig } from './lib/config';
export type { IMiddleWare } from './lib/middleware';
export type { ICallState, TransactionDealer } from './lib/callState';

export { ProjectDir as ProjectDir } from './util/resolve';
export { createRequestListener } from './serverHttp';
export { ServiceError, throwServiceError } from './lib/ServiceError';
export type { GatewayType, GwExtras, GwHttp, GwKoa } from './lib/gateway';
export { execute, getCallState, getProxiedPath } from './executor';
export { getConfig } from './lib/config';
export { getDebug } from './util/debug';
export { addDisposer, shutdown } from './util/addDisposer';
export { innerCall } from './innerCall';
export { mapCall } from './mapCall';
export { outerCall, setOuterCallAddr } from './outerCall';
export { laterCall, setEnqueue, setHttpEnqueue } from './laterCall';
export { resolved, waitReady } from './lifecycle';

export { waitFlowStart, bindFlow } from './flow';
