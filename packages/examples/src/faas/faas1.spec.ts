/**
 * 接口独立文件，方便将 *.spec.ts 导出给需要的调用方工程使用。
 * 也方便使用 tsconfig.json 中单独 include，防止全面包含过于浪费资源
 */
interface ISpec {
  path: '/faas1',
  request: {
    user: string,
    age: number,
  },
  response: {
    name: string,
    count: number,
    PI: number,
  }
}

export type { ISpec };
