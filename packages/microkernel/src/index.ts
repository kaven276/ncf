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
export { test } from './testClient';
export { innerCall, runFaasAsTask } from './innerCall';
export { resolved, waitReady } from './lifecycle';
