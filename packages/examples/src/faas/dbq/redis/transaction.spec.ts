export interface IRequest {
  key?: string,
  value?: number,
}

export interface ISpec {
  path: '/dbq/redis/transaction',
  request: IRequest,
  response: any,
}
