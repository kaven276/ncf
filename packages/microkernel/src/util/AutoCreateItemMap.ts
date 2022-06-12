
/** 方便创建附加于 faas 上的数据，确保从 map 中取 item 无会自动创建 item */
export class AutoCreateItemMap<T> extends Map<string, T> {
  constructor() {
    super();
  }
  /** 从 map 中获取 item，如不存在则创建，保存到map然后返回新创建的 */
  getOrCreate(path: string, creator: () => T): T {
    let data = this.get(path);
    if (!data) {
      data = creator();
      this.set(path, data);
    }
    return data
  }
}
