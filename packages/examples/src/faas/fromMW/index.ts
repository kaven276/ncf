import { cfgSwitch } from 'src/mw/ClassDemo';

export const config = {
  // 开关对应的中间件，控制其是否生效
  ...cfgSwitch.set(true),
}
