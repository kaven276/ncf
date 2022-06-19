import Xray from 'x-ray';
import { env } from 'src/env';
const x = Xray();

/** 搜索指定 npm 包的 npm 条目网页，提取其中的 meta 信息 */
export const faas = async () => {
  return x(`http://localhost:${env.PORT}/react/userTable`, 'tr', [{
    name: 'td:nth-child(1)',
    age: 'td:nth-child(3)',
  }])
}
