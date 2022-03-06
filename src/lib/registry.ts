/**
 * 服务注册
 */

type ServicePath = string;
type Service = Function;

/** 注册登录表，path 到 服务函数 */
export const registry = new Map<ServicePath, Service>();

export function registerService(name: string, svc: Service) {
  registry.set(name, svc);
}

export function getService(name: string): Service | undefined {
  return registry.get(name);
}


