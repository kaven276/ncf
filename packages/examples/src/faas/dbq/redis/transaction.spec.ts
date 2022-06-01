export interface IRequest {
  key?: string,
  value?: number,
}

export interface ISpec {
  path: '/redis/transaction',
  request: IRequest,
  response: any,
}
