/** 使用 tuple push 到 later 服务，并且记录到 db，比使用 object 节省处理开销，节省传输量和存储量 */
export type LaterTaskTuple = [
  /** 调用路径 */
  path: string,
  /** 请求 */
  request: any,
  /** dueTime, Date 对应的数字 */
  dueTime?: number,
  /** 第几次重试 */
  retry?: number
]
