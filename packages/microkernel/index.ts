import { jsExt } from './src/util/resolve';
if (!process.env.DEBUG && jsExt === '.ts') {
  process.env.DEBUG = '*';
}

export type { IApi, IFaasModule, Service } from './src/lib/faas';
export type { IConfig } from './src/lib/config';
export type { IMiddleWare } from './src/lib/middleware';
export type { ICallState, TransactionDealer } from './src/lib/callState';

export { ProjectDir as ProjectDir } from './src/util/resolve';
export { createRequestListener } from './src/serverHttp';
export { ServiceError, throwServiceError } from './src/lib/ServiceError';
export type { GatewayType, GwExtras, GwHttp, GwKoa } from './src/lib/gateway';
export { execute, getCallState, getProxiedPath } from './src/executor';
export { getConfig } from './src/lib/config';
export { getDebug } from './src/util/debug';
export { test } from './src/testClient';
export { innerCall, runFaasAsTask } from './src/innerCall';
export { resolved, waitReady } from './src/lifecycle';
