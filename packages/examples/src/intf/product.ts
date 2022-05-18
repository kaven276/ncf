export interface IProduct {
  /** 产品唯一编码 */
  code: string,
  /** 产品名称 */
  name: string,
  /** 生产厂商 */
  manufacturer: string,
  /** 销售厂商 */
  saler: string,
  /** 标称价格(人民币分) */
  listPrice: number,
  /** 分类 */
  category?: string,
}
