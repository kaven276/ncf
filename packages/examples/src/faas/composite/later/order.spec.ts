export interface Request {
  /** 下单用户标识 */
  userId: string,
  /** 所选产品标识 */
  productId: string,
  /** 采购量 */
  amount: number,
}

/**
 * 接口独立文件，方便将 *.spec.ts 导出给需要的调用方工程使用。
 * 也方便使用 tsconfig.json 中单独 include，防止全面包含过于浪费资源
 */
export interface ISpec {
  path: '/composite/later/order',
  request: Request,
  response: void,
}
