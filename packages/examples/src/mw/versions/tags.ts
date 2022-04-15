// 这里规定好所有已知的灰度标签

/** 反模式对照组，使用普通的 value union 类型，描述性不足，不推荐使用 */
type Tag_ =
  | 'new-layout'
  | 'order-push'
  | 'dark-theme'
  ;

/** 使用 enum 替代 value union 类型，为了能对每个取值增加说明提示 */
enum Tag {
  /** 新布局 */
  NewLayout = "NewLayout",
  /** 订单后台完成后推送到前台消息 */
  OrderPush = "OrderPush",
  /** 使用暗黑风格支持 */
  DarkTheme = "dark-theme"
}

export { Tag };
