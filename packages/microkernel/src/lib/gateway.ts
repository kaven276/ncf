// 定义各种 gateway 接入类型
import { IncomingMessage, ServerResponse } from 'http';
import type { Context } from 'koa';

/**
 * http: 直接通过 nodejs 内置 http 接入核心
 * koa: 通过 koa 方式接入核心
 */
export type GatewayType = 'http' | 'koa' | 'socket.io';


export interface GwHttp {
  gwtype: 'http',
  /** nodejs 原生 http callback 的 req,res */
  readonly http: {
    readonly req: IncomingMessage,
    readonly res: ServerResponse,
  },
}

export interface GwKoa {
  gwtype: 'koa',
  /** nodejs 原生 http callback 的 req,res */
  readonly http: {
    readonly req: IncomingMessage,
    readonly res: ServerResponse,
  },
  /** koa ctx */
  ctx: Context,
}

export interface GwSocketIO {
  gwtype: 'socket.io',
  /** nodejs 原生 http callback 的 req,res */
  readonly sio: {

  },
}

export type GwExtras = GwHttp | GwKoa | GwSocketIO;
