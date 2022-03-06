export interface ISpec {
  path: '/faas1',
  request: {
    user?: string,
  },
  response: {
    name: string,
    count: number,
    PI: number,
  }
}
